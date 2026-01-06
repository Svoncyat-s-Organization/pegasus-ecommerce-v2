package com.pegasus.backend.features.dashboard.service;

import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.customer.repository.CustomerRepository;
import com.pegasus.backend.features.dashboard.dto.*;
import com.pegasus.backend.features.inventory.repository.StockRepository;
import com.pegasus.backend.features.inventory.repository.WarehouseRepository;
import com.pegasus.backend.features.order.repository.OrderItemRepository;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.features.purchase.entity.PurchaseStatus;
import com.pegasus.backend.features.purchase.repository.PurchaseRepository;
import com.pegasus.backend.features.rma.repository.RmaRepository;
import com.pegasus.backend.shared.enums.OrderStatus;
import com.pegasus.backend.shared.enums.RmaStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
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
import java.time.format.TextStyle;
import java.util.*;

/**
 * Servicio para métricas y estadísticas del Dashboard
 * Consume datos de múltiples módulos sin tablas propias
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final StockRepository stockRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseRepository purchaseRepository;
    private final RmaRepository rmaRepository;
    private final EntityManager entityManager;

    // Umbral para stock bajo (configurable)
    private static final int LOW_STOCK_THRESHOLD = 10;
    
    // Zona horaria de Perú (UTC-5)
    private static final ZoneOffset PERU_OFFSET = ZoneOffset.ofHours(-5);

    /**
     * Obtener resumen completo del dashboard
     * Un solo endpoint que retorna todas las métricas para optimizar llamadas
     */
    public DashboardSummaryResponse getDashboardSummary() {
        log.info("Generating dashboard summary");
        
        return new DashboardSummaryResponse(
                getSalesMetrics(),
                getCustomerMetrics(),
                getInventoryMetrics(),
                getPurchaseMetrics(),
                getRmaMetrics(),
                getOrdersByStatus(),
                getTopProducts(5),
                getRecentOrders(10),
                getSalesChartData()
        );
    }

    /**
     * Métricas de ventas del mes actual vs mes anterior
     */
    public SalesMetricsResponse getSalesMetrics() {
        log.debug("Calculating sales metrics");
        
        OffsetDateTime now = OffsetDateTime.now(PERU_OFFSET);
        OffsetDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        OffsetDateTime endOfLastMonth = startOfMonth.minusNanos(1);

        // Ventas este mes (solo pedidos pagados, procesados, enviados o entregados)
        List<OrderStatus> countableStatuses = List.of(
                OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED
        );
        
        Object[] currentMonthData = getSalesDataForPeriod(startOfMonth, now, countableStatuses);
        BigDecimal currentSales = (BigDecimal) currentMonthData[0];
        Long currentOrders = (Long) currentMonthData[1];

        Object[] lastMonthData = getSalesDataForPeriod(startOfLastMonth, endOfLastMonth, countableStatuses);
        BigDecimal lastMonthSales = (BigDecimal) lastMonthData[0];
        Long lastMonthOrders = (Long) lastMonthData[1];

        // Calcular crecimiento
        BigDecimal salesGrowth = calculateGrowthPercent(currentSales, lastMonthSales);
        BigDecimal ordersGrowth = calculateGrowthPercent(
                BigDecimal.valueOf(currentOrders), 
                BigDecimal.valueOf(lastMonthOrders)
        );

        // Ticket promedio
        BigDecimal averageTicket = currentOrders > 0 
                ? currentSales.divide(BigDecimal.valueOf(currentOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new SalesMetricsResponse(
                currentSales,
                currentOrders,
                averageTicket,
                salesGrowth,
                ordersGrowth,
                "Este Mes"
        );
    }

    /**
     * Métricas de clientes
     */
    public CustomerMetricsResponse getCustomerMetrics() {
        log.debug("Calculating customer metrics");
        
        OffsetDateTime now = OffsetDateTime.now(PERU_OFFSET);
        OffsetDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        OffsetDateTime endOfLastMonth = startOfMonth.minusNanos(1);

        Long totalCustomers = customerRepository.count();
        
        Long activeCustomers = countActiveCustomers();
        Long newThisMonth = countNewCustomers(startOfMonth, now);
        Long newLastMonth = countNewCustomers(startOfLastMonth, endOfLastMonth);

        BigDecimal customerGrowth = calculateGrowthPercent(
                BigDecimal.valueOf(newThisMonth),
                BigDecimal.valueOf(newLastMonth)
        );

        return new CustomerMetricsResponse(
                totalCustomers,
                activeCustomers,
                newThisMonth,
                newLastMonth,
                customerGrowth
        );
    }

    /**
     * Métricas de inventario
     */
    public InventoryMetricsResponse getInventoryMetrics() {
        log.debug("Calculating inventory metrics");
        
        Long totalProducts = productRepository.count();
        Long activeProducts = countActiveProducts();
        Long totalVariants = variantRepository.count();
        
        // Stock bajo y agotado
        Long lowStockCount = countLowStock(LOW_STOCK_THRESHOLD);
        Long outOfStockCount = countOutOfStock();
        
        // Valor total del inventario
        BigDecimal inventoryValue = calculateInventoryValue();
        
        // Productos con stock bajo (top 10)
        List<LowStockProductResponse> lowStockProducts = getLowStockProducts(10);

        return new InventoryMetricsResponse(
                totalProducts,
                activeProducts,
                totalVariants,
                lowStockCount,
                outOfStockCount,
                inventoryValue,
                lowStockProducts
        );
    }

    /**
     * Métricas de compras
     */
    public PurchaseMetricsResponse getPurchaseMetrics() {
        log.debug("Calculating purchase metrics");
        
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);

        Object[] currentMonthData = getPurchaseDataForPeriod(startOfMonth, now);
        Long currentPurchases = (Long) currentMonthData[0];
        BigDecimal currentAmount = (BigDecimal) currentMonthData[1];

        Object[] lastMonthData = getPurchaseDataForPeriod(startOfLastMonth, endOfLastMonth);
        Long lastMonthPurchases = (Long) lastMonthData[0];

        Long pendingPurchases = countPendingPurchases();

        BigDecimal purchaseGrowth = calculateGrowthPercent(
                BigDecimal.valueOf(currentPurchases),
                BigDecimal.valueOf(lastMonthPurchases)
        );

        return new PurchaseMetricsResponse(
                currentPurchases,
                currentAmount,
                pendingPurchases,
                lastMonthPurchases,
                purchaseGrowth
        );
    }

    /**
     * Métricas de RMA (devoluciones)
     */
    public RmaMetricsResponse getRmaMetrics() {
        log.debug("Calculating RMA metrics");
        
        OffsetDateTime now = OffsetDateTime.now(PERU_OFFSET);
        OffsetDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        Long pendingRmas = rmaRepository.countByStatus(RmaStatus.PENDING);
        
        Long inProgressRmas = countInProgressRmas();
        
        Long completedThisMonth = countCompletedRmasInPeriod(startOfMonth, now);
        
        BigDecimal refundedThisMonth = calculateRefundedAmount(startOfMonth, now);
        
        // Tasa de devolución (RMAs del mes / Pedidos del mes * 100)
        Long ordersThisMonth = countOrdersInPeriod(startOfMonth, now);
        Long rmasThisMonth = countRmasInPeriod(startOfMonth, now);
        BigDecimal returnRate = ordersThisMonth > 0
                ? BigDecimal.valueOf(rmasThisMonth * 100).divide(BigDecimal.valueOf(ordersThisMonth), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new RmaMetricsResponse(
                pendingRmas,
                inProgressRmas,
                completedThisMonth,
                refundedThisMonth,
                returnRate
        );
    }

    /**
     * Pedidos agrupados por estado
     */
    public List<OrdersByStatusResponse> getOrdersByStatus() {
        log.debug("Getting orders by status");
        
        List<OrdersByStatusResponse> result = new ArrayList<>();
        
        Map<OrderStatus, String> statusLabels = Map.of(
                OrderStatus.PENDING, "Pendiente",
                OrderStatus.AWAIT_PAYMENT, "Esperando Pago",
                OrderStatus.PAID, "Pagado",
                OrderStatus.PROCESSING, "En Proceso",
                OrderStatus.SHIPPED, "Enviado",
                OrderStatus.DELIVERED, "Entregado",
                OrderStatus.CANCELLED, "Cancelado",
                OrderStatus.REFUNDED, "Reembolsado"
        );

        String jpql = "SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status";
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        List<Object[]> results = query.getResultList();

        for (Object[] row : results) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            result.add(new OrdersByStatusResponse(
                    status.name(),
                    count,
                    statusLabels.getOrDefault(status, status.name())
            ));
        }

        return result;
    }

    /**
     * Productos más vendidos (por cantidad)
     */
    public List<TopProductResponse> getTopProducts(int limit) {
        log.debug("Getting top {} products", limit);
        
        String jpql = """
                SELECT oi.productId, oi.productName, p.code, oi.sku, 
                       SUM(oi.quantity), SUM(oi.total)
                FROM OrderItem oi
                JOIN oi.order o
                LEFT JOIN Product p ON oi.productId = p.id
                WHERE o.status IN (:statuses)
                GROUP BY oi.productId, oi.productName, p.code, oi.sku
                ORDER BY SUM(oi.quantity) DESC
                """;
        
        List<OrderStatus> countableStatuses = List.of(
                OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED
        );
        
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setParameter("statuses", countableStatuses);
        query.setMaxResults(limit);
        
        List<Object[]> results = query.getResultList();
        List<TopProductResponse> topProducts = new ArrayList<>();
        
        for (Object[] row : results) {
            topProducts.add(new TopProductResponse(
                    (Long) row[0],
                    (String) row[1],
                    (String) row[2],
                    (String) row[3],
                    (Long) row[4],
                    (BigDecimal) row[5]
            ));
        }
        
        return topProducts;
    }

    /**
     * Pedidos más recientes
     */
    public List<RecentOrderResponse> getRecentOrders(int limit) {
        log.debug("Getting last {} orders", limit);
        
        Map<OrderStatus, String> statusLabels = Map.of(
                OrderStatus.PENDING, "Pendiente",
                OrderStatus.AWAIT_PAYMENT, "Esperando Pago",
                OrderStatus.PAID, "Pagado",
                OrderStatus.PROCESSING, "En Proceso",
                OrderStatus.SHIPPED, "Enviado",
                OrderStatus.DELIVERED, "Entregado",
                OrderStatus.CANCELLED, "Cancelado",
                OrderStatus.REFUNDED, "Reembolsado"
        );
        
        String jpql = """
                SELECT o.id, o.orderNumber, CONCAT(c.firstName, ' ', c.lastName), 
                       o.total, o.status, o.createdAt
                FROM Order o
                LEFT JOIN o.customer c
                ORDER BY o.createdAt DESC
                """;
        
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setMaxResults(limit);
        
        List<Object[]> results = query.getResultList();
        List<RecentOrderResponse> recentOrders = new ArrayList<>();
        
        for (Object[] row : results) {
            OrderStatus status = (OrderStatus) row[4];
            recentOrders.add(new RecentOrderResponse(
                    (Long) row[0],
                    (String) row[1],
                    (String) row[2],
                    (BigDecimal) row[3],
                    status.name(),
                    statusLabels.getOrDefault(status, status.name()),
                    (OffsetDateTime) row[5]
            ));
        }
        
        return recentOrders;
    }

    /**
     * Datos para gráficos de ventas
     */
    public SalesChartDataResponse getSalesChartData() {
        log.debug("Generating sales chart data");
        
        List<ChartPointResponse> dailySales = getDailySalesData(30);
        List<ChartPointResponse> monthlySales = getMonthlySalesData(12);
        
        return new SalesChartDataResponse(dailySales, monthlySales);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Obtener datos de ventas para un período
     */
    private Object[] getSalesDataForPeriod(OffsetDateTime start, OffsetDateTime end, List<OrderStatus> statuses) {
        String jpql = """
                SELECT COALESCE(SUM(o.total), 0), COUNT(o)
                FROM Order o
                WHERE o.createdAt BETWEEN :start AND :end
                AND o.status IN (:statuses)
                """;
        
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setParameter("start", start);
        query.setParameter("end", end);
        query.setParameter("statuses", statuses);
        
        Object[] result = query.getSingleResult();
        return new Object[]{
                result[0] != null ? result[0] : BigDecimal.ZERO,
                result[1] != null ? result[1] : 0L
        };
    }

    /**
     * Contar clientes activos (isActive = true)
     */
    private Long countActiveCustomers() {
        String jpql = "SELECT COUNT(c) FROM Customer c WHERE c.isActive = true";
        return entityManager.createQuery(jpql, Long.class).getSingleResult();
    }

    /**
     * Contar nuevos clientes en un período
     */
    private Long countNewCustomers(OffsetDateTime start, OffsetDateTime end) {
        String jpql = "SELECT COUNT(c) FROM Customer c WHERE c.createdAt BETWEEN :start AND :end";
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
    }

    /**
     * Contar productos activos
     */
    private Long countActiveProducts() {
        String jpql = "SELECT COUNT(p) FROM Product p WHERE p.isActive = true";
        return entityManager.createQuery(jpql, Long.class).getSingleResult();
    }

    /**
     * Contar variantes con stock bajo
     */
    private Long countLowStock(int threshold) {
        String jpql = """
                SELECT COUNT(DISTINCT s.variantId) 
                FROM Stock s 
                WHERE (s.quantity - s.reservedQuantity) > 0 
                AND (s.quantity - s.reservedQuantity) <= :threshold
                """;
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("threshold", threshold)
                .getSingleResult();
    }

    /**
     * Contar variantes sin stock
     */
    private Long countOutOfStock() {
        String jpql = """
                SELECT COUNT(DISTINCT s.variantId) 
                FROM Stock s 
                WHERE (s.quantity - s.reservedQuantity) <= 0
                """;
        return entityManager.createQuery(jpql, Long.class).getSingleResult();
    }

    /**
     * Calcular valor total del inventario
     */
    private BigDecimal calculateInventoryValue() {
        String jpql = """
                SELECT COALESCE(SUM(s.quantity * v.price), 0)
                FROM Stock s
                JOIN Variant v ON s.variantId = v.id
                WHERE s.quantity > 0
                """;
        return entityManager.createQuery(jpql, BigDecimal.class).getSingleResult();
    }

    /**
     * Obtener productos con stock bajo
     */
    private List<LowStockProductResponse> getLowStockProducts(int limit) {
        String jpql = """
                SELECT s.variantId, p.name, v.sku, w.name,
                       s.quantity, s.reservedQuantity, (s.quantity - s.reservedQuantity)
                FROM Stock s
                JOIN Variant v ON s.variantId = v.id
                JOIN Product p ON v.productId = p.id
                JOIN Warehouse w ON s.warehouseId = w.id
                WHERE (s.quantity - s.reservedQuantity) <= :threshold
                ORDER BY (s.quantity - s.reservedQuantity) ASC
                """;
        
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setParameter("threshold", LOW_STOCK_THRESHOLD);
        query.setMaxResults(limit);
        
        List<Object[]> results = query.getResultList();
        List<LowStockProductResponse> lowStockProducts = new ArrayList<>();
        
        for (Object[] row : results) {
            lowStockProducts.add(new LowStockProductResponse(
                    (Long) row[0],
                    (String) row[1],
                    (String) row[2],
                    (String) row[3],
                    (Integer) row[4],
                    (Integer) row[5],
                    (Integer) row[6]
            ));
        }
        
        return lowStockProducts;
    }

    /**
     * Obtener datos de compras para un período
     */
    private Object[] getPurchaseDataForPeriod(LocalDate start, LocalDate end) {
        String jpql = """
                SELECT COUNT(p), COALESCE(SUM(p.totalAmount), 0)
                FROM Purchase p
                WHERE p.purchaseDate BETWEEN :start AND :end
                AND p.status = :status
                """;
        
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setParameter("start", start);
        query.setParameter("end", end);
        query.setParameter("status", PurchaseStatus.RECEIVED);
        
        Object[] result = query.getSingleResult();
        return new Object[]{
                result[0] != null ? result[0] : 0L,
                result[1] != null ? result[1] : BigDecimal.ZERO
        };
    }

    /**
     * Contar compras pendientes
     */
    private Long countPendingPurchases() {
        String jpql = "SELECT COUNT(p) FROM Purchase p WHERE p.status = :status";
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("status", PurchaseStatus.PENDING)
                .getSingleResult();
    }

    /**
     * Contar RMAs en proceso
     */
    private Long countInProgressRmas() {
        List<RmaStatus> inProgressStatuses = List.of(
                RmaStatus.APPROVED, RmaStatus.IN_TRANSIT, RmaStatus.RECEIVED, RmaStatus.INSPECTING
        );
        String jpql = "SELECT COUNT(r) FROM Rma r WHERE r.status IN (:statuses)";
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("statuses", inProgressStatuses)
                .getSingleResult();
    }

    /**
     * Contar RMAs completadas en un período
     */
    private Long countCompletedRmasInPeriod(OffsetDateTime start, OffsetDateTime end) {
        String jpql = """
                SELECT COUNT(r) FROM Rma r 
                WHERE r.status IN (:statuses)
                AND r.closedAt BETWEEN :start AND :end
                """;
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("statuses", List.of(RmaStatus.REFUNDED, RmaStatus.CLOSED))
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
    }

    /**
     * Calcular monto reembolsado en un período
     */
    private BigDecimal calculateRefundedAmount(OffsetDateTime start, OffsetDateTime end) {
        String jpql = """
                SELECT COALESCE(SUM(r.refundAmount), 0) FROM Rma r 
                WHERE r.status IN (:statuses)
                AND r.refundedAt BETWEEN :start AND :end
                """;
        return entityManager.createQuery(jpql, BigDecimal.class)
                .setParameter("statuses", List.of(RmaStatus.REFUNDED, RmaStatus.CLOSED))
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
    }

    /**
     * Contar pedidos en un período
     */
    private Long countOrdersInPeriod(OffsetDateTime start, OffsetDateTime end) {
        String jpql = "SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end";
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
    }

    /**
     * Contar RMAs en un período
     */
    private Long countRmasInPeriod(OffsetDateTime start, OffsetDateTime end) {
        String jpql = "SELECT COUNT(r) FROM Rma r WHERE r.createdAt BETWEEN :start AND :end";
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
    }

    /**
     * Obtener ventas diarias (últimos N días)
     * Usa Native Query con funciones PostgreSQL
     */
    @SuppressWarnings("unchecked")
    private List<ChartPointResponse> getDailySalesData(int days) {
        OffsetDateTime now = OffsetDateTime.now(PERU_OFFSET);
        OffsetDateTime start = now.minusDays(days).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<String> countableStatuses = List.of("PAID", "PROCESSING", "SHIPPED", "DELIVERED");
        
        String sql = """
                SELECT DATE(o.created_at) as sale_date, 
                       COALESCE(SUM(o.total), 0) as total_sales, 
                       COUNT(o.id) as order_count
                FROM orders o
                WHERE o.created_at >= :start
                AND o.status IN (:statuses)
                GROUP BY DATE(o.created_at)
                ORDER BY DATE(o.created_at) ASC
                """;
        
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("start", start);
        query.setParameter("statuses", countableStatuses);
        
        List<Object[]> results = query.getResultList();
        
        // Crear mapa con resultados
        Map<LocalDate, Object[]> dataMap = new HashMap<>();
        for (Object[] row : results) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            dataMap.put(date, row);
        }
        
        // Llenar días sin datos con ceros
        List<ChartPointResponse> chartData = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = now.toLocalDate().minusDays(i);
            Object[] data = dataMap.get(date);
            
            if (data != null) {
                chartData.add(new ChartPointResponse(
                        date.toString(),
                        (BigDecimal) data[1],
                        ((Number) data[2]).longValue()
                ));
            } else {
                chartData.add(new ChartPointResponse(
                        date.toString(),
                        BigDecimal.ZERO,
                        0L
                ));
            }
        }
        
        return chartData;
    }

    /**
     * Obtener ventas mensuales (últimos N meses)
     * Usa Native Query con funciones PostgreSQL (EXTRACT)
     */
    @SuppressWarnings("unchecked")
    private List<ChartPointResponse> getMonthlySalesData(int months) {
        OffsetDateTime now = OffsetDateTime.now(PERU_OFFSET);
        OffsetDateTime start = now.minusMonths(months).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<String> countableStatuses = List.of("PAID", "PROCESSING", "SHIPPED", "DELIVERED");
        
        String sql = """
                SELECT EXTRACT(YEAR FROM o.created_at)::INTEGER as sale_year, 
                       EXTRACT(MONTH FROM o.created_at)::INTEGER as sale_month,
                       COALESCE(SUM(o.total), 0) as total_sales, 
                       COUNT(o.id) as order_count
                FROM orders o
                WHERE o.created_at >= :start
                AND o.status IN (:statuses)
                GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at)
                ORDER BY EXTRACT(YEAR FROM o.created_at) ASC, EXTRACT(MONTH FROM o.created_at) ASC
                """;
        
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("start", start);
        query.setParameter("statuses", countableStatuses);
        
        List<Object[]> results = query.getResultList();
        
        // Crear mapa con resultados (key: "YYYY-MM")
        Map<String, Object[]> dataMap = new HashMap<>();
        for (Object[] row : results) {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            String key = String.format("%d-%02d", year, month);
            dataMap.put(key, row);
        }
        
        // Llenar meses sin datos con ceros
        List<ChartPointResponse> chartData = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            OffsetDateTime date = now.minusMonths(i);
            String key = String.format("%d-%02d", date.getYear(), date.getMonthValue());
            String label = date.getMonth().getDisplayName(TextStyle.SHORT, new Locale("es", "PE")) 
                    + " " + date.getYear();
            
            Object[] data = dataMap.get(key);
            
            if (data != null) {
                chartData.add(new ChartPointResponse(
                        label,
                        (BigDecimal) data[2],
                        ((Number) data[3]).longValue()
                ));
            } else {
                chartData.add(new ChartPointResponse(
                        label,
                        BigDecimal.ZERO,
                        0L
                ));
            }
        }
        
        return chartData;
    }

    /**
     * Calcular porcentaje de crecimiento
     */
    private BigDecimal calculateGrowthPercent(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current != null && current.compareTo(BigDecimal.ZERO) > 0) {
                return new BigDecimal("100.00"); // 100% crecimiento si antes era 0
            }
            return BigDecimal.ZERO;
        }
        
        return current.subtract(previous)
                .multiply(new BigDecimal("100"))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }
}
