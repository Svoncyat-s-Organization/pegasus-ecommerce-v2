import { Modal, Descriptions, Tag } from 'antd';
import { formatCurrency } from '@shared/utils/formatters';
import type { ShippingMethod } from '@types';

interface ShippingMethodViewModalProps {
  open: boolean;
  onClose: () => void;
  shippingMethod?: ShippingMethod;
}

export const ShippingMethodViewModal = ({
  open,
  onClose,
  shippingMethod,
}: ShippingMethodViewModalProps) => {
  if (!shippingMethod) return null;

  return (
    <Modal
      title="Detalles del Método de Envío"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Nombre" span={2}>
          {shippingMethod.name}
        </Descriptions.Item>
        <Descriptions.Item label="Transportista" span={2}>
          {shippingMethod.carrier}
        </Descriptions.Item>
        <Descriptions.Item label="Descripción" span={2}>
          {shippingMethod.description}
        </Descriptions.Item>
        <Descriptions.Item label="Días Mínimos">
          {shippingMethod.estimatedDaysMin} días
        </Descriptions.Item>
        <Descriptions.Item label="Días Máximos">
          {shippingMethod.estimatedDaysMax} días
        </Descriptions.Item>
        <Descriptions.Item label="Costo Base">
          {formatCurrency(shippingMethod.baseCost)}
        </Descriptions.Item>
        <Descriptions.Item label="Costo por Kg">
          {formatCurrency(shippingMethod.costPerKg)}
        </Descriptions.Item>
        <Descriptions.Item label="Estado" span={2}>
          <Tag color={shippingMethod.isActive ? 'success' : 'error'}>
            {shippingMethod.isActive ? 'Activo' : 'Inactivo'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
