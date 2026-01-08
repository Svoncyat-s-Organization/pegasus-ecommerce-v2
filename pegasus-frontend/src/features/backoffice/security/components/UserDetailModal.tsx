import { Modal, Descriptions, Tag, Spin, Button, Space, Popconfirm } from 'antd';
import { IconKey, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useUser } from '../hooks/useUsers';
import { useToggleUserStatus, useDeleteUser } from '../hooks/useUserMutations';
import { ChangePasswordModal } from './ChangePasswordModal';
import { USER_STATUS } from '../constants/userConstants';
import { formatDateTime, formatPhone } from '@shared/utils/formatters';

interface UserDetailModalProps {
  userId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const UserDetailModal = ({ userId, visible, onClose }: UserDetailModalProps) => {
  const { data: user, isLoading } = useUser(userId || 0, { enabled: !!userId && visible });
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const handleToggleStatus = () => {
    if (!user) return;
    toggleStatus.mutate(user.id, { onSuccess: onClose });
  };

  const handleDelete = () => {
    if (!user) return;
    deleteUser.mutate(user.id, { onSuccess: onClose });
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  return (
    <>
      <Modal
        title="Detalle de Usuario"
        open={visible}
        onCancel={onClose}
        width={700}
        footer={[
          <Button key="close" onClick={onClose}>
            Cerrar
          </Button>,
        ]}
      >
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        )}

        {!isLoading && user && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Usuario" span={2}>
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">{user.firstName}</Descriptions.Item>
              <Descriptions.Item label="Apellido">{user.lastName}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Documento">
                {user.docType}
              </Descriptions.Item>
              <Descriptions.Item label="Número de Documento">
                {user.docNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono" span={2}>
                {user.phone ? formatPhone(user.phone) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado" span={2}>
                <Tag color={user.isActive ? USER_STATUS.ACTIVE.color : USER_STATUS.INACTIVE.color}>
                  {user.isActive ? USER_STATUS.ACTIVE.text : USER_STATUS.INACTIVE.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Creación">
                {formatDateTime(user.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización">
                {formatDateTime(user.updatedAt)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Space>
                <Button
                  icon={<IconKey size={16} />}
                  onClick={handleChangePassword}
                >
                  Cambiar Contraseña
                </Button>
                <Button
                  type={user.isActive ? 'default' : 'primary'}
                  onClick={handleToggleStatus}
                >
                  {user.isActive ? 'Desactivar' : 'Activar'}
                </Button>
                <Popconfirm
                  title="¿Eliminar usuario?"
                  description="Esta acción no se puede deshacer"
                  onConfirm={handleDelete}
                  okText="Eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<IconTrash size={16} />}>
                    Eliminar
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </>
        )}
      </Modal>

      <ChangePasswordModal
        userId={userId}
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </>
  );
};
