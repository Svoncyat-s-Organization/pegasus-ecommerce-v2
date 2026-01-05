import { Descriptions, Modal, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { formatCurrency } from '@shared/utils/formatters';
import { INVOICE_STATUS_META, INVOICE_TYPE_LABEL } from '../constants/billingConstants';
import { useBillingInvoiceDetail } from '../hooks/useBillingInvoices';

const { Text } = Typography;

interface InvoiceDetailModalProps {
  open: boolean;
  invoiceId: number | null;
  onCancel: () => void;
}

export const InvoiceDetailModal = ({ open, invoiceId, onCancel }: InvoiceDetailModalProps) => {
  const { data, isLoading } = useBillingInvoiceDetail(invoiceId);

  return (
    <Modal title="Detalle del comprobante" open={open} onCancel={onCancel} footer={null} width={720} destroyOnClose>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {!isLoading && (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="ID">
            <Text>{data?.id ?? '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Pedido (orderId)">
            <Text>{data?.orderId ?? '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Tipo">
            <Text>{data?.invoiceType ? INVOICE_TYPE_LABEL[data.invoiceType] : '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Serie-Número">
            <Text>{data ? `${data.series}-${data.number}` : '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Documento receptor">
            <Text>{data?.receiverTaxId ?? '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nombre receptor">
            <Text>{data?.receiverName ?? '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Subtotal">
            <Text>{data ? formatCurrency(Number(data.subtotal || 0)) : '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="IGV">
            <Text>{data ? formatCurrency(Number(data.taxAmount || 0)) : '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Total">
            <Text strong>{data ? formatCurrency(Number(data.totalAmount || 0)) : '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {data?.status ? (
              <Tag color={INVOICE_STATUS_META[data.status].color}>{INVOICE_STATUS_META[data.status].text}</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Fecha emisión" span={2}>
            <Text>{data?.issuedAt ? dayjs(data.issuedAt).format('DD/MM/YYYY HH:mm') : '-'}</Text>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};
