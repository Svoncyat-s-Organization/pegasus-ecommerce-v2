package com.pegasus.backend.features.order.repository;

import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.shared.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Repository para la entidad Order
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Buscar pedido por número de orden
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Buscar pedidos por cliente con paginación
     */
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    /**
     * Buscar pedidos por estado con paginación
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    /**
     * Buscar pedidos por rango de fecha
     */
    Page<Order> findByCreatedAtBetween(
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Pageable pageable
    );

    /**
     * Búsqueda compleja con filtros opcionales
     * Busca por número de orden, nombre del cliente o email
     */
    @Query("""
            SELECT o FROM Order o
            LEFT JOIN o.customer c
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:status IS NULL OR o.status = :status)
            """)
    Page<Order> searchOrders(
            @Param("search") String search,
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    /**
     * Contar pedidos por cliente
     */
    long countByCustomerId(Long customerId);

    /**
     * Verificar si existe un order_number
     */
    boolean existsByOrderNumber(String orderNumber);
}
