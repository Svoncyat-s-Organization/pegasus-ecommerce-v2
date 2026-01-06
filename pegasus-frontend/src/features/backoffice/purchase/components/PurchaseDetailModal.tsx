import { useState } from 'react';
import { Button, Divider, InputNumber, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPackageImport } from '@tabler/icons-react';
import type { MovementResponse, PurchaseItemResponse } from '@types';
import { getMovementsByReference } from '@features/backoffice/inventory/api/movementsApi';
import { formatCurrency } from '@shared/utils/formatters';
import { PURCHASE_STATUS } from '../constants/purchaseConstants';
import { usePurchaseById } from '../hooks/usePurchases';
import { useReceivePurchaseItems, useUpdatePurchaseStatus } from '../hooks/usePurchaseMutations';

const { Text } = Typography;

interface PurchaseDetailModalProps {
  open: boolean;
  purchaseId: number | null;
  onCancel: () => void;
}

export const PurchaseDetailModal = ({ open, purchaseId, onCancel }: PurchaseDetailModalProps) => {
  const { data, isLoading } = usePurchaseById(open ? purchaseId : null);
  const queryClient = useQueryClient();
  const updateStatus = useUpdatePurchaseStatus();
  const receiveItems = useReceivePurchaseItems();

  const [receiveQtyByItemId, setReceiveQtyByItemId] = useState<Record<number, number>>({});

  const [movementsPage, setMovementsPage] = useState(0);
  const [movementsPageSize, setMovementsPageSize] = useState(10);

  const movementsQuery = useQuery({
    queryKey: ['movements', 'purchase', purchaseId, movementsPage, movementsPageSize],
    queryFn: () => getMovementsByReference(purchaseId as number, 'purchases', movementsPage, movementsPageSize),
    enabled: open && typeof purchaseId === 'number',
  });

  const handleReceive = async () => {
    if (!purchaseId) return;

    await updateStatus.mutateAsync({
      id: purchaseId,
      request: { status: 'RECEIVED' },
    });

    queryClient.invalidateQueries({
      queryKey: ['movements', 'purchase', purchaseId],
    });
  };

  const handleReceivePartial = async (itemId: number, maxQuantity: number) => {
    if (!purchaseId) return;

    const qty = receiveQtyByItemId[itemId] ?? maxQuantity;
    if (!qty || qty <= 0) return;

    await receiveItems.mutateAsync({
      id: purchaseId,
      request: { items: [{ itemId, quantity: qty }] },
    });

    setReceiveQtyByItemId((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const columns: ColumnsType<PurchaseItemResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'Variante',
      dataIndex: 'variantSku',
      key: 'variantSku',
      width: 170,
      render: (value: string | undefined, record) => value || String(record.variantId),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
    },
    {
      title: 'Recibido',
      key: 'received',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const received = record.receivedQuantity ?? 0;
        const total = record.quantity;
        const remaining = Math.max(0, total - received);
        const color = remaining === 0 ? 'green' : 'gold';
        return (
          <Space size="small" direction="vertical">
            <div>{received}/{total}</div>
            <Tag color={color}>{remaining === 0 ? 'Completo' : `Pendiente: ${remaining}`}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        const received = record.receivedQuantity ?? 0;
        const remaining = Math.max(0, record.quantity - received);
        const disabled = !data || data.status !== 'PENDING' || remaining === 0;

        return (
          <Space size="small">
            <InputNumber
              min={1}
              max={remaining}
              value={receiveQtyByItemId[record.id] ?? undefined}
              placeholder={remaining > 0 ? String(remaining) : '-'}
              disabled={disabled}
              onChange={(value) => {
                const numeric = typeof value === 'number' ? value : undefined;
                setReceiveQtyByItemId((prev) => ({
                  ...prev,
                  [record.id]: numeric ?? prev[record.id],
                }));
              }}
              style={{ width: 90 }}
            />
            <Button
              type="link"
              size="small"
              icon={<IconPackageImport size={16} />}
              title="Recepcionar parcial"
              disabled={disabled}
              loading={receiveItems.isPending}
              onClick={() => handleReceivePartial(record.id, remaining)}
            />
          </Space>
        );
      },
    },
  ];

  const movementColumns: ColumnsType<MovementResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1 + movementsPage * movementsPageSize,
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'variantSku',
      key: 'variantSku',
      width: 160,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
    },
    {
      title: 'Saldo',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'right',
    },
    {
      title: 'Costo unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 160,
      align: 'right',
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

          {data.status === 'PENDING' ? (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <Popconfirm
                title="¿Recepcionar esta compra?"
                description="Se actualizarán las existencias y se registrará el movimiento en Kardex."
                okText="Sí, recepcionar"
                cancelText="Cancelar"
                onConfirm={handleReceive}
              >
                <Button
                  type="primary"
                  icon={<IconPackageImport size={16} />}
                  loading={updateStatus.isPending}
                >
                  Recepcionar
                </Button>
              </Popconfirm>
            </div>
          ) : null}

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

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ marginBottom: 8 }}>
        <Text strong>Movimientos (Kardex)</Text>
        <div>
          <Text type="secondary">
            Registros de inventario generados por esta compra.
          </Text>
        </div>
      </div>

      <Table
        columns={movementColumns}
        dataSource={movementsQuery.data?.content || []}
        rowKey="id"
        loading={movementsQuery.isLoading}
        bordered
        pagination={{
          current: movementsPage + 1,
          pageSize: movementsPageSize,
          total: movementsQuery.data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} movimientos`,
          onChange: (newPage, newPageSize) => {
            setMovementsPage(newPage - 1);
            setMovementsPageSize(newPageSize);
          },
        }}
      />
    </Modal>
  );
};
