import { useState } from 'react';
import { Card, Tabs, Table, Button, Space, Popconfirm, Typography } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconKey } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useRoles } from '../hooks/useRoles';
import { useModules } from '../hooks/useModules';
import { useDeleteRole } from '../hooks/useRoleMutations';
import { useDeleteModule } from '../hooks/useModuleMutations';
import { RoleFormModal } from '../components/roles/RoleFormModal';
import { ModuleFormModal } from '../components/roles/ModuleFormModal';
import { AssignModulesToRoleModal } from '../components/roles/AssignModulesToRoleModal';
import { RBAC_TABS } from '../constants/rbacConstants';
import type { RoleResponse, ModuleResponse } from '@types';

const { Title } = Typography;

export const RolesPermissionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>(RBAC_TABS.ROLES);

  // Role modals
  const [roleFormVisible, setRoleFormVisible] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [assignModulesVisible, setAssignModulesVisible] = useState(false);
  const [assignRoleName, setAssignRoleName] = useState('');

  // Module modals
  const [moduleFormVisible, setModuleFormVisible] = useState(false);
  const [moduleFormMode, setModuleFormMode] = useState<'create' | 'edit'>('create');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: modules, isLoading: isLoadingModules } = useModules();
  const deleteRole = useDeleteRole();
  const deleteModule = useDeleteModule();

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

  // ===== Module Handlers =====
  const handleCreateModule = () => {
    setSelectedModuleId(null);
    setModuleFormMode('create');
    setModuleFormVisible(true);
  };

  const handleEditModule = (id: number) => {
    setSelectedModuleId(id);
    setModuleFormMode('edit');
    setModuleFormVisible(true);
  };

  const handleDeleteModule = (id: number) => {
    deleteModule.mutate(id);
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

  // ===== Module Columns =====
  const moduleColumns: ColumnsType<ModuleResponse> = [
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
      title: 'Ruta',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Ícono',
      dataIndex: 'icon',
      key: 'icon',
      width: 150,
      render: (icon: string | undefined) => icon || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEditModule(record.id)}
            title="Editar"
          />
          <Popconfirm
            title="¿Eliminar este módulo?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteModule(record.id)}
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

  const tabItems = [
    {
      key: RBAC_TABS.ROLES,
      label: 'Roles',
      children: (
        <>
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
        </>
      ),
    },
    {
      key: RBAC_TABS.MODULES,
      label: 'Módulos del Sistema',
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<IconPlus size={18} />}
              onClick={handleCreateModule}
            >
              Crear Módulo
            </Button>
          </div>
          <Table
            columns={moduleColumns}
            dataSource={modules}
            rowKey="id"
            loading={isLoadingModules}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>Roles y Permisos</Title>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginTop: 16 }}
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

      {/* Module Modals */}
      <ModuleFormModal
        mode={moduleFormMode}
        moduleId={selectedModuleId}
        visible={moduleFormVisible}
        onClose={() => setModuleFormVisible(false)}
      />
    </Card>
  );
};
