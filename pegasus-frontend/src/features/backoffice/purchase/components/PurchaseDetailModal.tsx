import { Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { PurchaseItemResponse } from '@types';
import { formatCurrency } from '@shared/utils/formatters';
import { PURCHASE_STATUS } from '../constants/purchaseConstants';
import { usePurchaseById } from '../hooks/usePurchases';

const { Text } = Typography;

interface PurchaseDetailModalProps {
  open: boolean;
  purchaseId: number | null;
  onCancel: () => void;
}

export const PurchaseDetailModal = ({ open, purchaseId, onCancel }: PurchaseDetailModalProps) => {
  const { data, isLoading } = usePurchaseById(open ? purchaseId : null);

  const columns: ColumnsType<PurchaseItemResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ID de variante',
      dataIndex: 'variantId',
      key: 'variantId',
      width: 140,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
    },
    {
      title: 'Costo unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 160,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 160,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
  ];

  return (
    <Modal
      title="Detalle de compra"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      {data ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <Text><strong>Proveedor:</strong> {data.supplier.companyName}</Text>
            <Text><strong>Comprobante:</strong> {data.invoiceType} {data.invoiceNumber}</Text>
            <Text><strong>Fecha:</strong> {data.purchaseDate ? dayjs(data.purchaseDate).format('DD/MM/YYYY') : '-'}</Text>
            <Text><strong>Total:</strong> {formatCurrency(Number(data.totalAmount || 0))}</Text>
            <Text>
              <strong>Estado:</strong>{' '}
              <Tag color={PURCHASE_STATUS[data.status].color}>{PURCHASE_STATUS[data.status].text}</Tag>
            </Text>
          </div>
          {data.notes ? <div style={{ marginTop: 8 }}><Text type="secondary">{data.notes}</Text></div> : null}
        </div>
      ) : null}

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={false}
      />
    </Modal>
  );
};
