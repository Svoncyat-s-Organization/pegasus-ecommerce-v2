import { useState } from 'react';
import { Button, Card, Input, Space, Table, Tag, Typography, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { IconEdit, IconEye, IconPlus, IconRefresh, IconSearch, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { PurchaseResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { formatCurrency } from '@shared/utils/formatters';
import { PURCHASE_STATUS } from '../constants/purchaseConstants';
import { PurchaseDetailModal } from '../components/PurchaseDetailModal';
import { PurchaseFormModal } from '../components/PurchaseFormModal';
import { PurchaseStatusModal } from '../components/PurchaseStatusModal';
import { usePurchases } from '../hooks/usePurchases';
import { useDeletePurchase } from '../hooks/usePurchaseMutations';

const { Title, Text } = Typography;

export const PurchasesListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState<PurchaseResponse['status'] | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, refetch, isFetching } = usePurchases(page, pageSize, debouncedSearch || undefined);
  const deletePurchase = useDeletePurchase();

  const handleOpenDetail = (id: number) => {
    setSelectedPurchaseId(id);
    setDetailOpen(true);
  };

  const handleOpenStatus = (id: number, status: PurchaseResponse['status']) => {
    setSelectedPurchaseId(id);
    setSelectedPurchaseStatus(status);
    setStatusOpen(true);
  };

  const handleDelete = (id: number) => {
    deletePurchase.mutate(id);
  };

  const columns: ColumnsType<PurchaseResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
    },
    {
      title: 'Proveedor',
      key: 'supplier',
      render: (_, record) => record.supplier.companyName,
    },
    {
      title: 'Comprobante',
      key: 'invoice',
      width: 220,
      render: (_, record) => `${record.invoiceType} ${record.invoiceNumber}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (value: string | undefined) => value ? dayjs(value).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PurchaseResponse['status']) => (
        <Tag color={PURCHASE_STATUS[status].color}>{PURCHASE_STATUS[status].text}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center' as const,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalle',
            icon: <IconEye size={16} />,
            onClick: () => handleOpenDetail(record.id),
          },
          {
            key: 'status',
            label: 'Actualizar estado',
            icon: <IconEdit size={16} />,
            onClick: () => handleOpenStatus(record.id, record.status),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar compra?',
                content: 'Esta acción no se puede deshacer',
                okText: 'Eliminar',
                cancelText: 'Cancelar',
                okButtonProps: { danger: true },
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<IconDotsVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Órdenes de Compra</Title>
        <Text type="secondary">Gestión de compras a proveedores: registro, estados e ítems.</Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Input
          placeholder="Buscar por proveedor o comprobante..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 420 }}
        />
        <Space>
          <Button icon={<IconRefresh size={18} />} onClick={() => refetch()} loading={isFetching} title="Actualizar lista">
            Actualizar
          </Button>
          <Button type="primary" icon={<IconPlus size={18} />} onClick={() => setCreateOpen(true)}>
            Nueva Compra
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} compras`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <PurchaseFormModal open={createOpen} onCancel={() => setCreateOpen(false)} />

      <PurchaseDetailModal
        open={detailOpen}
        purchaseId={selectedPurchaseId}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedPurchaseId(null);
        }}
      />

      <PurchaseStatusModal
        open={statusOpen}
        purchaseId={selectedPurchaseId}
        currentStatus={selectedPurchaseStatus}
        onCancel={() => {
          setStatusOpen(false);
          setSelectedPurchaseId(null);
          setSelectedPurchaseStatus(null);
        }}
      />
    </Card>
  );
};
