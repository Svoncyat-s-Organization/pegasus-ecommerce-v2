package com.pegasus.backend.features.report.service;

import com.pegasus.backend.features.invoice.entity.InvoiceType;
import com.pegasus.backend.features.purchase.entity.PurchaseStatus;
import com.pegasus.backend.features.report.dto.*;
import com.pegasus.backend.shared.enums.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio para generación de reportes contables
 * Consume datos de múltiples módulos (solo lectura)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

        private final EntityManager entityManager;

        private static final ZoneOffset PERU_OFFSET = ZoneOffset.ofHours(-5);

        /**
         * Reporte de ventas por período
         */
        public SalesReportResponse getSalesReport(LocalDate startDate, LocalDate endDate) {
                log.info("Generating sales report from {} to {}", startDate, endDate);

                OffsetDateTime start = startDate.atStartOfDay().atOffset(PERU_OFFSET);
                OffsetDateTime end = endDate.plusDays(1).atStartOfDay().atOffset(PERU_OFFSET);

                List<OrderStatus> validStatuses = List.of(
                                OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

                // Totales
                String totalJpql = """
                                SELECT COUNT(o), COALESCE(SUM(o.total), 0)
                                FROM Order o
                                WHERE o.createdAt >= :start AND o.createdAt < :end
                                AND o.status IN (:statuses)
                                """;

                Object[] totals = entityManager.createQuery(totalJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .setParameter("statuses", validStatuses)
                                .getSingleResult();

                Long totalOrders = (Long) totals[0];
                BigDecimal totalSales = (BigDecimal) totals[1];
                BigDecimal averageTicket = totalOrders > 0
                                ? totalSales.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // Desglose diario
                String dailyJpql = """
                                SELECT FUNCTION('DATE', o.createdAt), COUNT(o), COALESCE(SUM(o.total), 0)
                                FROM Order o
                                WHERE o.createdAt >= :start AND o.createdAt < :end
                                AND o.status IN (:statuses)
                                GROUP BY FUNCTION('DATE', o.createdAt)
                                ORDER BY FUNCTION('DATE', o.createdAt)
                                """;

                List<Object[]> dailyResults = entityManager.createQuery(dailyJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .setParameter("statuses", validStatuses)
                                .getResultList();

                List<SalesReportResponse.SalesRow> details = dailyResults.stream()
                                .map(row -> new SalesReportResponse.SalesRow(
                                                ((java.sql.Date) row[0]).toLocalDate(),
                                                (Long) row[1],
                                                (BigDecimal) row[2]))
                                .toList();

                return new SalesReportResponse(startDate, endDate, totalOrders, totalSales, averageTicket, details);
        }

        /**
         * Reporte de facturación
         */
        public InvoiceReportResponse getInvoiceReport(LocalDate startDate, LocalDate endDate) {
                log.info("Generating invoice report from {} to {}", startDate, endDate);

                OffsetDateTime start = startDate.atStartOfDay().atOffset(PERU_OFFSET);
                OffsetDateTime end = endDate.plusDays(1).atStartOfDay().atOffset(PERU_OFFSET);

                // Conteos por tipo
                String countJpql = """
                                SELECT i.invoiceType, COUNT(i), COALESCE(SUM(i.taxAmount), 0), COALESCE(SUM(i.totalAmount), 0)
                                FROM Invoice i
                                WHERE i.issuedAt >= :start AND i.issuedAt < :end
                                GROUP BY i.invoiceType
                                """;

                List<Object[]> counts = entityManager.createQuery(countJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .getResultList();

                Long totalInvoices = 0L;
                Long totalBills = 0L;
                BigDecimal totalTax = BigDecimal.ZERO;
                BigDecimal totalAmount = BigDecimal.ZERO;

                for (Object[] row : counts) {
                        InvoiceType type = (InvoiceType) row[0];
                        Long count = (Long) row[1];
                        BigDecimal tax = (BigDecimal) row[2];
                        BigDecimal amount = (BigDecimal) row[3];

                        if (type == InvoiceType.INVOICE) {
                                totalInvoices = count;
                        } else if (type == InvoiceType.BILL) {
                                totalBills = count;
                        }
                        totalTax = totalTax.add(tax);
                        totalAmount = totalAmount.add(amount);
                }

                // Detalle de documentos
                String detailJpql = """
                                SELECT i.id, i.invoiceType, i.series, i.number, i.issuedAt,
                                       i.receiverTaxId, i.receiverName, i.subtotal, i.taxAmount, i.totalAmount, i.status
                                FROM Invoice i
                                WHERE i.issuedAt >= :start AND i.issuedAt < :end
                                ORDER BY i.issuedAt DESC
                                """;

                List<Object[]> details = entityManager.createQuery(detailJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .getResultList();

                List<InvoiceReportResponse.InvoiceRow> documents = details.stream()
                                .map(row -> new InvoiceReportResponse.InvoiceRow(
                                                (Long) row[0],
                                                ((InvoiceType) row[1]).name(),
                                                (String) row[2],
                                                (String) row[3],
                                                (OffsetDateTime) row[4],
                                                (String) row[5],
                                                (String) row[6],
                                                (BigDecimal) row[7],
                                                (BigDecimal) row[8],
                                                (BigDecimal) row[9],
                                                row[10].toString()))
                                .toList();

                return new InvoiceReportResponse(startDate, endDate, totalInvoices, totalBills,
                                totalTax, totalAmount, documents);
        }

        /**
         * Reporte de compras
         */
        public PurchaseReportResponse getPurchaseReport(LocalDate startDate, LocalDate endDate) {
                log.info("Generating purchase report from {} to {}", startDate, endDate);

                // Totales
                String totalJpql = """
                                SELECT COUNT(p), COALESCE(SUM(p.totalAmount), 0)
                                FROM Purchase p
                                WHERE p.purchaseDate >= :start AND p.purchaseDate <= :end
                                AND p.status = :status
                                """;

                Object[] totals = entityManager.createQuery(totalJpql, Object[].class)
                                .setParameter("start", startDate)
                                .setParameter("end", endDate)
                                .setParameter("status", PurchaseStatus.RECEIVED)
                                .getSingleResult();

                Long totalPurchases = (Long) totals[0];
                BigDecimal totalAmount = (BigDecimal) totals[1];

                // Por proveedor
                String bySupplierJpql = """
                                SELECT s.id, s.companyName, s.docNumber, COUNT(p), COALESCE(SUM(p.totalAmount), 0)
                                FROM Purchase p
                                JOIN p.supplier s
                                WHERE p.purchaseDate >= :start AND p.purchaseDate <= :end
                                AND p.status = :status
                                GROUP BY s.id, s.companyName, s.docNumber
                                ORDER BY SUM(p.totalAmount) DESC
                                """;

                List<Object[]> supplierResults = entityManager.createQuery(bySupplierJpql, Object[].class)
                                .setParameter("start", startDate)
                                .setParameter("end", endDate)
                                .setParameter("status", PurchaseStatus.RECEIVED)
                                .getResultList();

                List<PurchaseReportResponse.PurchaseRow> bySupplier = supplierResults.stream()
                                .map(row -> new PurchaseReportResponse.PurchaseRow(
                                                (Long) row[0],
                                                (String) row[1],
                                                (String) row[2],
                                                (Long) row[3],
                                                (BigDecimal) row[4]))
                                .toList();

                return new PurchaseReportResponse(startDate, endDate, totalPurchases, totalAmount, bySupplier);
        }

        /**
         * Reporte de inventario valorizado
         */
        public InventoryReportResponse getInventoryReport() {
                log.info("Generating inventory report");

                LocalDate reportDate = LocalDate.now();

                // Totales
                String totalJpql = """
                                SELECT COUNT(DISTINCT s.variantId), COALESCE(SUM(s.quantity), 0),
                                       COALESCE(SUM(s.quantity * v.price), 0)
                                FROM Stock s
                                JOIN Variant v ON s.variantId = v.id
                                WHERE s.quantity > 0
                                """;

                Object[] totals = entityManager.createQuery(totalJpql, Object[].class).getSingleResult();

                Long totalVariants = (Long) totals[0];
                Long totalUnitsLong = (Long) totals[1];
                Integer totalUnits = totalUnitsLong.intValue();
                BigDecimal totalValue = (BigDecimal) totals[2];

                // Por almacén
                String byWarehouseJpql = """
                                SELECT w.id, w.name, COUNT(DISTINCT s.variantId), COALESCE(SUM(s.quantity), 0),
                                       COALESCE(SUM(s.quantity * v.price), 0)
                                FROM Stock s
                                JOIN Variant v ON s.variantId = v.id
                                JOIN Warehouse w ON s.warehouseId = w.id
                                WHERE s.quantity > 0
                                GROUP BY w.id, w.name
                                ORDER BY SUM(s.quantity * v.price) DESC
                                """;

                List<Object[]> warehouseResults = entityManager.createQuery(byWarehouseJpql, Object[].class)
                                .getResultList();

                List<InventoryReportResponse.WarehouseRow> byWarehouse = warehouseResults.stream()
                                .map(row -> new InventoryReportResponse.WarehouseRow(
                                                (Long) row[0],
                                                (String) row[1],
                                                (Long) row[2],
                                                ((Long) row[3]).intValue(),
                                                (BigDecimal) row[4]))
                                .toList();

                return new InventoryReportResponse(reportDate, totalVariants, totalUnits, totalValue, byWarehouse);
        }

        /**
         * Reporte de pagos recibidos
         */
        public PaymentReportResponse getPaymentReport(LocalDate startDate, LocalDate endDate) {
                log.info("Generating payment report from {} to {}", startDate, endDate);

                OffsetDateTime start = startDate.atStartOfDay().atOffset(PERU_OFFSET);
                OffsetDateTime end = endDate.plusDays(1).atStartOfDay().atOffset(PERU_OFFSET);

                // Totales
                String totalJpql = """
                                SELECT COUNT(p), COALESCE(SUM(p.amount), 0)
                                FROM Payment p
                                WHERE p.paymentDate >= :start AND p.paymentDate < :end
                                """;

                Object[] totals = entityManager.createQuery(totalJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .getSingleResult();

                Long totalPayments = (Long) totals[0];
                BigDecimal totalAmount = (BigDecimal) totals[1];

                // Por método de pago
                String byMethodJpql = """
                                SELECT pm.id, pm.name, COUNT(p), COALESCE(SUM(p.amount), 0)
                                FROM Payment p
                                JOIN PaymentMethod pm ON p.paymentMethodId = pm.id
                                WHERE p.paymentDate >= :start AND p.paymentDate < :end
                                GROUP BY pm.id, pm.name
                                ORDER BY SUM(p.amount) DESC
                                """;

                List<Object[]> methodResults = entityManager.createQuery(byMethodJpql, Object[].class)
                                .setParameter("start", start)
                                .setParameter("end", end)
                                .getResultList();

                List<PaymentReportResponse.PaymentMethodRow> byPaymentMethod = methodResults.stream()
                                .map(row -> new PaymentReportResponse.PaymentMethodRow(
                                                (Long) row[0],
                                                (String) row[1],
                                                (Long) row[2],
                                                (BigDecimal) row[3]))
                                .toList();

                return new PaymentReportResponse(startDate, endDate, totalPayments, totalAmount, byPaymentMethod);
        }
}
