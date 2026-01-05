package com.pegasus.backend.features.purchase.entity;

/**
 * Supplier document types.
 *
 * NOTE: This is intentionally separate from shared DocumentType (DNI/CE),
 * because suppliers can also be identified by RUC in Peru.
 */
public enum SupplierDocumentType {
    DNI,
    RUC
}
