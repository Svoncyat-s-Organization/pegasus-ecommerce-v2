package com.pegasus.backend.features.order.repository;

import com.pegasus.backend.features.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para la entidad OrderItem
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Buscar todos los items de un pedido
     */
    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Buscar items por variante (útil para verificar qué órdenes tienen una variante)
     */
    List<OrderItem> findByVariantId(Long variantId);

    /**
     * Buscar items por producto
     */
    List<OrderItem> findByProductId(Long productId);
}
