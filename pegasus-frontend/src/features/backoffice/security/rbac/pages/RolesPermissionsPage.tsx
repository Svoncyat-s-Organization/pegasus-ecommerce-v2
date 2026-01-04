import { useState } from 'react';
import { Card, Table, Button, Space, Popconfirm, Typography } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconKey } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useRoles } from '../hooks/useRoles';
import { useDeleteRole } from '../hooks/useRoleMutations';
import { RoleFormModal } from '../components/roles/RoleFormModal';
import { AssignModulesToRoleModal } from '../components/roles/AssignModulesToRoleModal';
import type { RoleResponse } from '@types';

const { Title } = Typography;

export const RolesPermissionsPage = () => {
  // Role modals
  const [roleFormVisible, setRoleFormVisible] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [assignModulesVisible, setAssignModulesVisible] = useState(false);
  const [assignRoleName, setAssignRoleName] = useState('');

  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const deleteRole = useDeleteRole();

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
      render: (_, __, index) => index + 1,
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
      <Title level={2}>Roles y Permisos</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<IconPlus size={18} />}
          onClick={handleCreateRole}
        >
          Crear Rol
        </Button>
      </div>
      
      <Table
        columns={roleColumns}
        dataSource={roles}
        rowKey="id"
        loading={isLoadingRoles}
        pagination={false}
        scroll={{ x: 800 }}
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
