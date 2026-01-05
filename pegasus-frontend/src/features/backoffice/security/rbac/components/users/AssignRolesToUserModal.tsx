import { useMemo, useState } from 'react';
import { Modal, Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { useRoles } from '../../hooks/useRoles';
import { useRolesByUser, useAssignRolesToUser } from '../../hooks/useAssignments';

interface AssignRolesToUserModalProps {
  userId: number | null;
  username: string;
  visible: boolean;
  onClose: () => void;
}

interface RecordType {
  key: string;
  title: string;
  description?: string;
}

export const AssignRolesToUserModal = ({
  userId,
  username,
  visible,
  onClose,
}: AssignRolesToUserModalProps) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { data: allRoles, isLoading: isLoadingRoles } = useRoles();
  const { data: userRoles, isLoading: isLoadingUserRoles } = useRolesByUser(
    userId || 0,
    { enabled: !!userId && visible }
  );
  const assignRoles = useAssignRolesToUser();

  const initialTargetKeys = useMemo(
    () => userRoles?.roles?.map((r) => r.id.toString()) || [],
    [userRoles]
  );

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
    if (!userId) return;

    const roleIds = targetKeys.map((key) => parseInt(key, 10));

    assignRoles.mutate(
      { userId, roleIds },
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
    allRoles?.map((role) => ({
      key: role.id.toString(),
      title: role.name,
      description: role.description,
    })) || [];

  const isLoading = isLoadingRoles || isLoadingUserRoles;

  return (
    <Modal
      title={`Asignar Roles - ${username}`}
      open={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      afterOpenChange={(open) => {
        if (open) {
          setTargetKeys(initialTargetKeys);
          setSelectedKeys([]);
        }
      }}
      confirmLoading={assignRoles.isPending}
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
            message="Selecciona los roles que se asignarán a este usuario"
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
                {item.description && (
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                )}
              </div>
            )}
            listStyle={{
              width: 300,
              height: 400,
            }}
            showSearch
            filterOption={(inputValue, item) =>
              item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
              (item.description?.toLowerCase().includes(inputValue.toLowerCase()) ?? false)
            }
          />
        </>
      )}
    </Modal>
  );
};
