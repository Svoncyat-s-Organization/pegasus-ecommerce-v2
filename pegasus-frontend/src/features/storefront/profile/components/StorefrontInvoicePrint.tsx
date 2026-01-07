import { formatCurrency } from '@shared/utils/formatters';
import type { InvoiceSummaryResponse, OrderItemResponse } from '@types';
import dayjs from 'dayjs';
import { forwardRef } from 'react';

interface StorefrontInvoicePrintProps {
    invoice: InvoiceSummaryResponse;
    items: OrderItemResponse[];
}

const COMPANY = {
    name: 'PEGASUS',
    ruc: '20601234567',
    address: 'Jr. San Martín 123 - Tarapoto, San Martín',
    phone: '(042) 000-000',
};

const getDocumentTitle = (invoiceType: string): string =>
    invoiceType === 'BILL' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';

export const StorefrontInvoicePrint = forwardRef<HTMLDivElement, StorefrontInvoicePrintProps>(
    ({ invoice, items }, ref) => {
        const docTitle = getDocumentTitle(invoice.invoiceType);

        return (
            <div ref={ref} className="print-content" style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                <style>
                    {`
                  @media print {
                      @page { margin: 0; size: auto; }
                      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                      .print-content { 
                           visibility: visible !important;
                           position: absolute;
                           left: 0;
                           top: 0;
                           width: 100%;
                           margin: 0;
                           padding: 20px;
                           background: white;
                           color: black;
                      }
                      body > *:not(.print-content) { display: none !important; }
                  }
              `}
                </style>
                <div style={{ maxWidth: '300px', margin: '0 auto', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>{COMPANY.name}</div>
                        <div style={{ fontSize: '12px', marginBottom: '2px' }}>RUC: {COMPANY.ruc}</div>
                        <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '2px' }}>{COMPANY.address}</div>
                        <div style={{ fontSize: '12px' }}>Telf: {COMPANY.phone}</div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '15px', border: '1px solid #000', padding: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{docTitle}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '5px' }}>
                            {invoice.series}-{invoice.number}
                        </div>
                    </div>

                    <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>FECHA:</span>
                            <span>{invoice.issuedAt ? dayjs(invoice.issuedAt).format('DD/MM/YYYY HH:mm') : '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>CLIENTE:</span>
                            <span style={{ textTransform: 'uppercase', textAlign: 'right', maxWidth: '60%' }}>{invoice.receiverName || 'CLIENTE EXPRES'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>DNI/RUC:</span>
                            <span>{invoice.receiverTaxId || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>PEDIDO:</span>
                            <span>{invoice.orderId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold' }}>MONEDA:</span>
                            <span>SOLES (S/)</span>
                        </div>
                    </div>

                    <table style={{ width: '100%', fontSize: '12px', marginBottom: '15px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '5px 0' }}>CANT</th>
                                <th style={{ textAlign: 'left', padding: '5px 0' }}>DESCRIPCIÓN</th>
                                <th style={{ textAlign: 'right', padding: '5px 0' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px dashed #eee' }}>
                                    <td style={{ padding: '5px 0', verticalAlign: 'top' }}>{item.quantity}</td>
                                    <td style={{ padding: '5px 0' }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                                        <div style={{ fontSize: '10px' }}>P. Unit: {formatCurrency(item.unitPrice)}</div>
                                    </td>
                                    <td style={{ padding: '5px 0', textAlign: 'right', verticalAlign: 'top' }}>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px solid #000', paddingTop: '10px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>OP. GRAVADA</span>
                            <span>{formatCurrency(invoice.subtotal || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>I.G.V. (18%)</span>
                            <span>{formatCurrency(invoice.taxAmount || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', paddingTop: '5px', fontWeight: 'bold' }}>
                            <span>TOTAL A PAGAR</span>
                            <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' }}>Representación impresa del comprobante electrónico</div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8, fontStyle: 'italic' }}>¡Gracias por su preferencia!</div>
                    </div>
                </div>
            </div>
        );
    }
);
