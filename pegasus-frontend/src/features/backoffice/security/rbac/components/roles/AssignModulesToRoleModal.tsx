import { useEffect, useState } from 'react';
import { Modal, Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { useModules } from '../../hooks/useModules';
import { useModulesByRole, useAssignModulesToRole } from '../../hooks/useAssignments';

interface AssignModulesToRoleModalProps {
  roleId: number | null;
  roleName: string;
  visible: boolean;
  onClose: () => void;
}

interface RecordType {
  key: string;
  title: string;
  description: string;
}

export const AssignModulesToRoleModal = ({
  roleId,
  roleName,
  visible,
  onClose,
}: AssignModulesToRoleModalProps) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { data: allModules, isLoading: isLoadingModules } = useModules();
  const { data: roleModules, isLoading: isLoadingRoleModules } = useModulesByRole(
    roleId || 0,
    { enabled: !!roleId && visible }
  );
  const assignModules = useAssignModulesToRole();

  // Initialize targetKeys when roleModules loads
  useEffect(() => {
    if (roleModules?.modules) {
      setTargetKeys(roleModules.modules.map((m) => m.id.toString()));
    } else {
      setTargetKeys([]);
    }
  }, [roleModules]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  const handleSelectChange: TransferProps['onSelectChange'] = (
    sourceSelectedKeys,
    targetSelectedKeys
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys] as string[]);
  };

  const handleSave = () => {
    if (!roleId) return;

    const moduleIds = targetKeys.map((key) => parseInt(key, 10));

    assignModules.mutate(
      { roleId, moduleIds },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    setSelectedKeys([]);
    onClose();
  };

  const dataSource: RecordType[] =
    allModules?.map((module) => ({
      key: module.id.toString(),
      title: module.name,
      description: module.path,
    })) || [];

  const isLoading = isLoadingModules || isLoadingRoleModules;

  return (
    <Modal
      title={`Asignar Permisos - ${roleName}`}
      open={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={assignModules.isPending}
      okText="Guardar"
      cancelText="Cancelar"
      width={700}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Alert
            message="Selecciona los módulos a los que este rol tendrá acceso"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Transfer
            dataSource={dataSource}
            titles={['Disponibles', 'Asignados']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            render={(item) => (
              <div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
              </div>
            )}
            listStyle={{
              width: 300,
              height: 400,
            }}
            showSearch
            filterOption={(inputValue, item) =>
              item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
              item.description.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </>
      )}
    </Modal>
  );
};
