import { useState } from 'react';
import { Table, Button, Space, Tag, Input, Typography, Popconfirm, Card } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconEye, IconKey } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useUsers } from '../hooks/useUsers';
import { useDeleteUser } from '../hooks/useUserMutations';
import { UserFormModal } from '../components/UserFormModal';
import { UserDetailModal } from '../components/UserDetailModal';
import { AssignRolesToUserModal } from '../rbac';
import { USER_STATUS } from '../constants/userConstants';
import { formatPhone, useDebounce } from '@shared/utils/formatters';
import type { UserResponse } from '@types';

const { Title, Text } = Typography;

export const UsersListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignRolesVisible, setAssignRolesVisible] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useUsers(page, pageSize, debouncedSearch || undefined);
  const deleteUser = useDeleteUser();

  const handleView = (id: number) => {
    setSelectedUserId(id);
    setDetailModalVisible(true);
  };

  const handleEdit = (id: number) => {
    setSelectedUserId(id);
    setFormMode('edit');
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedUserId(null);
    setFormMode('create');
    setFormModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteUser.mutate(id);
  };

  const handleAssignRoles = (id: number, username: string) => {
    setSelectedUserId(id);
    setSelectedUsername(username);
    setAssignRolesVisible(true);
  };

  const columns: ColumnsType<UserResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
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
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (phone: string | null) => phone ? `+51 ${formatPhone(phone)}` : '-',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? USER_STATUS.ACTIVE.color : USER_STATUS.INACTIVE.color}>
          {isActive ? USER_STATUS.ACTIVE.text : USER_STATUS.INACTIVE.text}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconKey size={16} />}
            onClick={() => handleAssignRoles(record.id, record.username)}
            title="Asignar roles"
          />
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => handleView(record.id)}
            title="Ver detalle"
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEdit(record.id)}
            title="Editar"
          />
          <Popconfirm
            title="¿Eliminar usuario?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<IconTrash size={16} />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Usuarios</Title>
        <Text type="secondary">
          Gestión de usuarios del backoffice. Crea, edita y administra cuentas de staff.
        </Text>
      </div>

      {/* Actions Bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          placeholder="Buscar por usuario, email o nombre..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          style={{ width: 320 }}
          allowClear
          onClear={() => {
            setSearchTerm('');
            setPage(0);
          }}
        />
        <Button
          type="primary"
          icon={<IconPlus size={18} />}
          onClick={handleCreate}
        >
          Nuevo Usuario
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
          showTotal: (total) => `Total: ${total} usuarios`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      {/* Modals */}
      <UserFormModal
        mode={formMode}
        userId={formMode === 'edit' ? selectedUserId : null}
        visible={formModalVisible}
        onClose={() => {
          setFormModalVisible(false);
          setSelectedUserId(null);
        }}
      />

      <UserDetailModal
        userId={selectedUserId}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedUserId(null);
        }}
      />

      <AssignRolesToUserModal
        userId={selectedUserId}
        username={selectedUsername}
        visible={assignRolesVisible}
        onClose={() => {
          setAssignRolesVisible(false);
          setSelectedUserId(null);
        }}
      />
    </Card>
  );
};
