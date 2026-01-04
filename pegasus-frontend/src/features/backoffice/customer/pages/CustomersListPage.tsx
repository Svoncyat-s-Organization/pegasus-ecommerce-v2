import { useState } from 'react';
import { Table, Button, Space, Tag, Card, Typography, Popconfirm } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useCustomerMutations';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { CUSTOMER_STATUS } from '../constants/customerConstants';
import { formatPhone } from '@shared/utils/formatters';
import type { CustomerResponse } from '@types';

const { Title, Text } = Typography;

export const CustomersListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data, isLoading } = useCustomers(page, pageSize);
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
      width: 130,
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
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => handleView(record.id)}
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEdit(record.id)}
          />
          <Popconfirm
            title="¿Eliminar cliente?"
            description="El cliente será desactivado. ¿Deseas continuar?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger size="small" icon={<IconTrash size={16} />} />
          </Popconfirm>
        </Space>
      ),
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

      {/* Actions Bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
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
