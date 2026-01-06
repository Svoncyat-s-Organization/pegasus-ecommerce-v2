import { Button, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { InvoiceType, OrderItemResponse } from '@types';
import { formatCurrency } from '@shared/utils/formatters';
import { useBillingInvoiceDetail } from '../hooks/useBillingInvoices';
import { useOrderDetail } from '../../order/hooks/useOrderDetail';

interface InvoicePrintModalProps {
  open: boolean;
  invoiceId: number | null;
  onCancel: () => void;
}

const COMPANY = {
  name: 'Pegasus',
  ruc: '20601234567',
  address: 'Jr. San Martín 123 - Tarapoto, San Martín',
  phone: '(042) 000-000',
};

const getDocumentTitle = (invoiceType: InvoiceType): string =>
  invoiceType === 'BILL' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';

const normalizeItems = (items: OrderItemResponse[] | undefined) => {
  return (items || []).map((i) => ({
    key: String(i.id),
    qty: Number(i.quantity || 0),
    name: i.productName,
    unit: Number(i.unitPrice || 0),
    total: Number(i.total || 0),
  }));
};

const ReceiptContent = (props: {
  invoice: {
    invoiceType: InvoiceType;
    series: string;
    number: string;
    receiverName: string;
    receiverTaxId: string;
    orderId: number;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    issuedAt?: string;
  };
  items: Array<{ key: string; qty: number; name: string; unit: number; total: number }>;
}) => {
  const { invoice, items } = props;
  const docTitle = getDocumentTitle(invoice.invoiceType);

  return (
    <div
      id="print-area"
      style={{
        background: 'white',
        color: 'black',
        padding: 16,
        border: '1px dashed rgba(0, 0, 0, 0.35)',
        borderRadius: 12,
        maxWidth: 380,
        margin: '0 auto',
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed' }}>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 16 }}>{COMPANY.name}</div>
        <div style={{ fontSize: 11 }}>RUC: {COMPANY.ruc}</div>
        <div style={{ fontSize: 11, fontStyle: 'italic' }}>{COMPANY.address}</div>
        <div style={{ fontSize: 11 }}>Telf: {COMPANY.phone}</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16, border: '1px solid', padding: 12, fontWeight: 700 }}>
        <div>{docTitle}</div>
        <div>
          {invoice.series}-{invoice.number}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 700 }}>FECHA:</span>
          <span>{invoice.issuedAt ? dayjs(invoice.issuedAt).format('DD/MM/YYYY HH:mm') : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 700 }}>CLIENTE:</span>
          <span style={{ textTransform: 'uppercase' }}>{invoice.receiverName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 700 }}>DNI/RUC:</span>
          <span>{invoice.receiverTaxId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 700 }}>PEDIDO:</span>
          <span>{invoice.orderId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 700 }}>MONEDA:</span>
          <span>SOLES (S/)</span>
        </div>
      </div>

      <table style={{ width: '100%', fontSize: 12, marginBottom: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid' }}>
            <th style={{ textAlign: 'left', padding: '6px 0', width: 60 }}>CANT</th>
            <th style={{ textAlign: 'left', padding: '6px 0' }}>DESCRIPCIÓN</th>
            <th style={{ textAlign: 'right', padding: '6px 0', width: 120 }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: '10px 0', borderBottom: '1px dashed' }}>
                <span style={{ opacity: 0.75 }}>No hay items disponibles para mostrar.</span>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.key} style={{ borderBottom: '1px dashed' }}>
                <td style={{ padding: '10px 0', verticalAlign: 'top' }}>{item.qty}</td>
                <td style={{ padding: '10px 0' }}>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{item.name}</div>
                  <div style={{ fontSize: 10 }}>P. Unit: {formatCurrency(item.unit)}</div>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', verticalAlign: 'top', fontWeight: 700 }}>
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid', paddingTop: 10, fontSize: 12, lineHeight: 1.8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>OP. GRAVADA</span>
          <span>{formatCurrency(Number(invoice.subtotal || 0))}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>I.G.V. (18%)</span>
          <span>{formatCurrency(Number(invoice.taxAmount || 0))}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px dashed',
            marginTop: 8,
            paddingTop: 8,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <span>TOTAL A PAGAR</span>
          <span>{formatCurrency(Number(invoice.totalAmount || 0))}</span>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div
          style={{
            width: 92,
            height: 92,
            border: '1px solid',
            margin: '0 auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
          }}
        >
          QR
        </div>
        <div style={{ fontSize: 10, textTransform: 'uppercase' }}>Representación impresa del comprobante electrónico</div>
        <div style={{ fontSize: 10, marginTop: 4 }}>Consulte su documento en Pegasus</div>
        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8, fontStyle: 'italic' }}>¡Gracias por su preferencia!</div>
      </div>
    </div>
  );
};

export const InvoicePrintModal = ({ open, invoiceId, onCancel }: InvoicePrintModalProps) => {
  const { data, isLoading } = useBillingInvoiceDetail(invoiceId);

  const orderId = data?.orderId ?? null;
  const { data: orderDetail, isLoading: isLoadingOrder } = useOrderDetail(orderId);

  const canPrint = !!data && !isLoading && !isLoadingOrder;

  const docTitle = useMemo(() => {
    if (!data) return '';
    return getDocumentTitle(data.invoiceType);
  }, [data]);

  return (
    <Modal
      title={docTitle ? `Imprimir ${docTitle.toLowerCase()}` : 'Imprimir comprobante'}
      open={open}
      onCancel={onCancel}
      width={640}
      destroyOnClose
      styles={{ body: { padding: 12, maxHeight: '75vh', overflowY: 'auto' } }}
      footer={
        <>
          <Button onClick={onCancel}>Cerrar</Button>
          <Button
            type="primary"
            disabled={!canPrint}
            onClick={() => {
              if (!data) return;
              window.print();
            }}
          >
            Imprimir
          </Button>
        </>
      }
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {!isLoading && (isLoadingOrder || !data) && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {!isLoading && !isLoadingOrder && data && (
        <div style={{ background: 'transparent', padding: 8 }}>
          <div style={{ background: 'transparent', padding: 8 }}>
            <ReceiptContent
              invoice={{
                invoiceType: data.invoiceType,
                series: data.series,
                number: data.number,
                receiverName: data.receiverName,
                receiverTaxId: data.receiverTaxId,
                orderId: data.orderId,
                subtotal: data.subtotal,
                taxAmount: data.taxAmount,
                totalAmount: data.totalAmount,
                issuedAt: data.issuedAt,
              }}
              items={normalizeItems(orderDetail?.items)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
