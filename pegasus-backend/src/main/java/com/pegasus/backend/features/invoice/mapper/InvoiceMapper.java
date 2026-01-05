package com.pegasus.backend.features.invoice.mapper;

import com.pegasus.backend.features.invoice.dto.InvoiceResponse;
import com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse;
import com.pegasus.backend.features.invoice.entity.Invoice;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    InvoiceResponse toResponse(Invoice invoice);

    InvoiceSummaryResponse toSummaryResponse(Invoice invoice);

    List<InvoiceSummaryResponse> toSummaryResponseList(List<Invoice> invoices);
}
