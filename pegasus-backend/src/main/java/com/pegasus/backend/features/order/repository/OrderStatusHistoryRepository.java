package com.pegasus.backend.features.order.repository;

import com.pegasus.backend.features.order.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para la entidad OrderStatusHistory
 */
@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    /**
     * Buscar historial de estados de un pedido ordenado por fecha descendente
     */
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    /**
     * Buscar historial de estados de un pedido ordenado por fecha ascendente
     */
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
