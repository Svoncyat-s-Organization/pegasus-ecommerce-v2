package com.pegasus.backend.features.purchase.repository;

import com.pegasus.backend.features.purchase.entity.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
}
