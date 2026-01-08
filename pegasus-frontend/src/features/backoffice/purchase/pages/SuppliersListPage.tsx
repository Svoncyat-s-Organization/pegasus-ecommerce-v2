import { useState } from 'react';
import { Button, Card, Input, Table, Tag, Typography, Dropdown, Modal, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { IconEdit, IconPlus, IconPower, IconRefresh, IconSearch, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import type { SupplierResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { formatPhone } from '@shared/utils/formatters';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { SUPPLIER_STATUS } from '../constants/purchaseConstants';
import { useSuppliers } from '../hooks/useSuppliers';
import { useDeleteSupplier, useToggleSupplierStatus } from '../hooks/useSupplierMutations';

const { Title, Text } = Typography;

export const SuppliersListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, refetch, isFetching } = useSuppliers(page, pageSize, debouncedSearch || undefined);
  const deleteSupplier = useDeleteSupplier();
  const toggleStatus = useToggleSupplierStatus();

  const handleCreate = () => {
    setSelectedSupplierId(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedSupplierId(id);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteSupplier.mutate(id);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatus.mutate(id);
  };

  const columns: ColumnsType<SupplierResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
    },
    {
      title: 'Documento',
      key: 'document',
      width: 160,
      render: (_, record) => `${record.docType} ${record.docNumber}`,
    },
    {
      title: 'Razón social',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Contacto',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 180,
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (value: string | undefined) => (value ? formatPhone(value) : '-'),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag color={isActive ? SUPPLIER_STATUS.ACTIVE.color : SUPPLIER_STATUS.INACTIVE.color}>
          {isActive ? SUPPLIER_STATUS.ACTIVE.text : SUPPLIER_STATUS.INACTIVE.text}
        </Tag>
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
            key: 'edit',
            label: 'Editar',
            icon: <IconEdit size={16} />,
            onClick: () => handleEdit(record.id),
          },
          {
            type: 'divider',
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Desactivar' : 'Activar',
            icon: <IconPower size={16} />,
            onClick: () => handleToggleStatus(record.id),
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar proveedor?',
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
        <Title level={2} style={{ marginBottom: 8 }}>Proveedores</Title>
        <Text type="secondary">Gestión de proveedores para órdenes de compra y abastecimiento.</Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Input
          placeholder="Buscar por razón social o documento..."
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
          <Button type="primary" icon={<IconPlus size={18} />} onClick={handleCreate}>
            Nuevo Proveedor
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
          showTotal: (total) => `Total: ${total} proveedores`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <SupplierFormModal
        open={formOpen}
        mode={formMode}
        supplierId={formMode === 'edit' ? selectedSupplierId : null}
        onCancel={() => {
          setFormOpen(false);
          setSelectedSupplierId(null);
        }}
      />
    </Card>
  );
};
