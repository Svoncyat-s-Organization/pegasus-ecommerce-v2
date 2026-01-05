import { useState } from 'react';
import { Card, Table, Button, Space, Popconfirm, Typography, Input } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconKey, IconSearch } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useRoles } from '../hooks/useRoles';
import { useDeleteRole } from '../hooks/useRoleMutations';
import { RoleFormModal } from '../components/roles/RoleFormModal';
import { AssignModulesToRoleModal } from '../components/roles/AssignModulesToRoleModal';
import { useDebounce } from '@shared/hooks/useDebounce';
import type { RoleResponse } from '@types';

const { Title, Text } = Typography;

export const RolesPermissionsPage = () => {
  // Pagination and search
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Role modals
  const [roleFormVisible, setRoleFormVisible] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [assignModulesVisible, setAssignModulesVisible] = useState(false);
  const [assignRoleName, setAssignRoleName] = useState('');

  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const deleteRole = useDeleteRole();

  // Filter roles by search term
  const filteredRoles = roles?.filter(role => 
    role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    role.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  // Paginate filtered roles
  const paginatedRoles = filteredRoles.slice(page * pageSize, (page + 1) * pageSize);

  // ===== Role Handlers =====
  const handleCreateRole = () => {
    setSelectedRoleId(null);
    setRoleFormMode('create');
    setRoleFormVisible(true);
  };

  const handleEditRole = (id: number) => {
    setSelectedRoleId(id);
    setRoleFormMode('edit');
    setRoleFormVisible(true);
  };

  const handleDeleteRole = (id: number) => {
    deleteRole.mutate(id);
  };

  const handleAssignModules = (id: number, name: string) => {
    setSelectedRoleId(id);
    setAssignRoleName(name);
    setAssignModulesVisible(true);
  };

  // ===== Role Columns =====
  const roleColumns: ColumnsType<RoleResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => page * pageSize + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (description: string | undefined) => description || '-',
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
            onClick={() => handleAssignModules(record.id, record.name)}
            title="Asignar permisos"
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEditRole(record.id)}
            title="Editar"
          />
          <Popconfirm
            title="¿Eliminar este rol?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<IconTrash size={16} />}
              title="Eliminar"
            />
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
          Roles y Permisos
        </Title>
        <Text type="secondary">
          Gestión de roles y permisos del sistema. Define roles y asigna módulos con permisos específicos.
        </Text>
      </div>

      {/* Search and Actions Bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <Input
          placeholder="Buscar por nombre o descripción..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button
          type="primary"
          icon={<IconPlus size={18} />}
          onClick={handleCreateRole}
        >
          Crear Rol
        </Button>
      </div>
      
      {/* Table */}
      <Table
        columns={roleColumns}
        dataSource={paginatedRoles}
        rowKey="id"
        loading={isLoadingRoles}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: filteredRoles.length,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} roles`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      {/* Role Modals */}
      <RoleFormModal
        mode={roleFormMode}
        roleId={selectedRoleId}
        visible={roleFormVisible}
        onClose={() => setRoleFormVisible(false)}
      />

      <AssignModulesToRoleModal
        roleId={selectedRoleId}
        roleName={assignRoleName}
        visible={assignModulesVisible}
        onClose={() => setAssignModulesVisible(false)}
      />
    </Card>
  );
};
