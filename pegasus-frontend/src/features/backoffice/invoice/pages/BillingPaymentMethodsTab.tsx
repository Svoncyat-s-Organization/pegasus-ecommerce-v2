import { useState } from 'react';
import { Button, Input, Space, Table, Tag, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { IconEdit, IconPlus, IconPower, IconRefresh, IconSearch, IconDotsVertical } from '@tabler/icons-react';
import type { PaymentMethodResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { PaymentMethodFormModal } from '../components/PaymentMethodFormModal';
import { useBillingPaymentMethods } from '../hooks/useBillingPaymentMethods';
import { useToggleBillingPaymentMethod } from '../hooks/useBillingMutations';

export const BillingPaymentMethodsTab = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<PaymentMethodResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, refetch, isFetching } = useBillingPaymentMethods(page, pageSize, debouncedSearch || undefined);
  const toggleStatus = useToggleBillingPaymentMethod();

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelected(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (record: PaymentMethodResponse) => {
    setFormMode('edit');
    setSelected(record);
    setFormOpen(true);
  };

  const columns: ColumnsType<PaymentMethodResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Activo' : 'Inactivo'}</Tag>,
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
            onClick: () => handleOpenEdit(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Desactivar' : 'Activar',
            icon: <IconPower size={16} />,
            disabled: toggleStatus.isPending,
            onClick: () => toggleStatus.mutate(record.id),
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
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Input
          placeholder="Buscar por nombre..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 360 }}
        />

        <Space>
          <Button icon={<IconRefresh size={18} />} onClick={() => refetch()} loading={isFetching} title="Actualizar lista">
            Actualizar
          </Button>
          <Button type="primary" icon={<IconPlus size={18} />} onClick={handleOpenCreate}>
            Nuevo método
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
          showTotal: (total) => `Total: ${total} métodos`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <PaymentMethodFormModal
        open={formOpen}
        mode={formMode}
        initialValue={selected}
        onCancel={() => setFormOpen(false)}
      />
    </>
  );
};
