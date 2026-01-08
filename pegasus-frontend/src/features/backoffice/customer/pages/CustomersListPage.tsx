import { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Input, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IconPlus, IconEdit, IconTrash, IconEye, IconSearch, IconDotsVertical } from '@tabler/icons-react';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useCustomerMutations';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { CUSTOMER_STATUS } from '../constants/customerConstants';
import { formatPhone } from '@shared/utils/formatters';
import { useDebounce } from '@shared/hooks/useDebounce';
import type { CustomerResponse } from '@types';

const { Title, Text } = Typography;

export const CustomersListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data, isLoading } = useCustomers(page, pageSize, debouncedSearch || undefined);
  const deleteCustomer = useDeleteCustomer();

  const handleView = (id: number) => {
    setSelectedCustomerId(id);
    setDetailModalVisible(true);
  };

  const handleEdit = (id: number) => {
    setSelectedCustomerId(id);
    setFormMode('edit');
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedCustomerId(null);
    setFormMode('create');
    setFormModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteCustomer.mutate(id);
  };

  const columns: ColumnsType<CustomerResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => page * pageSize + index + 1,
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: 'Nombre Completo',
      key: 'fullName',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => (phone ? formatPhone(phone) : '-'),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => {
        const status = isActive ? CUSTOMER_STATUS.active : CUSTOMER_STATUS.inactive;
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalle',
            icon: <IconEye size={16} />,
            onClick: () => handleView(record.id),
          },
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
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar cliente?',
                content: 'El cliente será desactivado. ¿Deseas continuar?',
                okText: 'Sí',
                cancelText: 'No',
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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Clientes
        </Title>
        <Text type="secondary">
          Gestión de clientes del storefront. Administra cuentas, datos personales y direcciones.
        </Text>
      </div>

      {/* Search and Actions Bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <Input
          placeholder="Buscar por usuario, email o nombre..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={18} />} onClick={handleCreate}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Table */}
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
          showTotal: (total) => `Total: ${total} clientes`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      {/* Modals */}
      <CustomerFormModal
        mode={formMode}
        customerId={formMode === 'edit' ? selectedCustomerId : null}
        visible={formModalVisible}
        onClose={() => {
          setFormModalVisible(false);
          setSelectedCustomerId(null);
        }}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedCustomerId(null);
        }}
      />
    </Card>
  );
};
