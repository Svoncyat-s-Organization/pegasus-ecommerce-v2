import { useState } from 'react';
import { Modal, Descriptions, Tag, Button, Divider, Typography, Spin } from 'antd';
import { IconMapPin } from '@tabler/icons-react';
import { useCustomer } from '../hooks/useCustomers';
import { useToggleCustomerStatus } from '../hooks/useCustomerMutations';
import { AddressList } from './AddressList';
import { CUSTOMER_STATUS } from '../constants/customerConstants';
import { formatPhone } from '@shared/utils/formatters';

const { Title } = Typography;

interface CustomerDetailModalProps {
  customerId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const CustomerDetailModal = ({ customerId, visible, onClose }: CustomerDetailModalProps) => {
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const { data: customer, isLoading } = useCustomer(customerId || 0, { enabled: visible && !!customerId });
  const toggleStatus = useToggleCustomerStatus();

  if (!customerId) return null;

  const handleToggleStatus = () => {
    toggleStatus.mutate(customerId);
  };

  return (
    <Modal
      title="Detalle del Cliente"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : customer ? (
        <>
          {/* Customer Info */}
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Usuario" span={1}>
              {customer.username}
            </Descriptions.Item>
            <Descriptions.Item label="Estado" span={1}>
              <Tag color={customer.isActive ? CUSTOMER_STATUS.active.color : CUSTOMER_STATUS.inactive.color}>
                {customer.isActive ? CUSTOMER_STATUS.active.label : CUSTOMER_STATUS.inactive.label}
              </Tag>
              <Button size="small" type="link" onClick={handleToggleStatus}>
                {customer.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              {customer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Nombre Completo" span={2}>
              {customer.firstName} {customer.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Documento" span={1}>
              {customer.docType}
            </Descriptions.Item>
            <Descriptions.Item label="Número de Documento" span={1}>
              {customer.docNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Teléfono" span={2}>
              {customer.phone ? formatPhone(customer.phone) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Registro" span={1}>
              {new Date(customer.createdAt).toLocaleDateString('es-PE')}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización" span={1}>
              {new Date(customer.updatedAt).toLocaleDateString('es-PE')}
            </Descriptions.Item>
          </Descriptions>

          {/* Addresses Section */}
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              <IconMapPin size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Direcciones
            </Title>
            <Button type="primary" size="small" onClick={() => setAddressModalVisible(true)}>
              Agregar Dirección
            </Button>
          </div>

          <AddressList
            customerId={customerId}
            addressModalVisible={addressModalVisible}
            onCloseAddressModal={() => setAddressModalVisible(false)}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Typography.Text type="secondary">Cliente no encontrado</Typography.Text>
        </div>
      )}
    </Modal>
  );
};
