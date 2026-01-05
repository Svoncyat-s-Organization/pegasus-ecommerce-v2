import { Modal, Descriptions, Tag, Typography, Card, Divider } from 'antd';
import { formatCurrency, formatDate } from '@shared/utils/formatters';
import { SHIPMENT_STATUSES, SHIPMENT_TYPES } from '../constants';
import { TrackingEventsTimeline } from './TrackingEventsTimeline';
import type { Shipment } from '@types';

const { Title } = Typography;

interface ShipmentViewModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: 'default',
    IN_TRANSIT: 'blue',
    OUT_FOR_DELIVERY: 'cyan',
    DELIVERED: 'green',
    RETURNED: 'orange',
    CANCELLED: 'red',
  };
  return colorMap[status] || 'default';
};

export const ShipmentViewModal = ({ open, onClose, shipment }: ShipmentViewModalProps) => {
  if (!shipment) return null;

  const shippingAddressStr = typeof shipment.shippingAddress === 'string'
    ? shipment.shippingAddress
    : JSON.stringify(shipment.shippingAddress, null, 2);

  return (
    <Modal
      title="Detalles del Envío"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="ID">{shipment.id}</Descriptions.Item>
        <Descriptions.Item label="Número de Tracking">
          <Typography.Text strong>{shipment.trackingNumber}</Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Tipo">
          {SHIPMENT_TYPES[shipment.shipmentType as keyof typeof SHIPMENT_TYPES] || shipment.shipmentType}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={getStatusColor(shipment.status)}>
            {SHIPMENT_STATUSES[shipment.status as keyof typeof SHIPMENT_STATUSES] || shipment.status}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="ID de Orden">{shipment.orderId}</Descriptions.Item>
        <Descriptions.Item label="ID de RMA">
          {shipment.rmaId || <Typography.Text type="secondary">N/A</Typography.Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Método de Envío">
          {shipment.shippingMethodName || <Typography.Text type="secondary">N/A</Typography.Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Destinatario">{shipment.recipientName}</Descriptions.Item>

        <Descriptions.Item label="Teléfono">
          {shipment.recipientPhone || <Typography.Text type="secondary">N/A</Typography.Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Peso">{shipment.weightKg} kg</Descriptions.Item>

        <Descriptions.Item label="Costo de Envío">
          {formatCurrency(shipment.shippingCost)}
        </Descriptions.Item>
        <Descriptions.Item label="Cantidad de Paquetes">
          {shipment.packageQuantity}
        </Descriptions.Item>

        <Descriptions.Item label="Requiere Firma">
          {shipment.requireSignature ? 'Sí' : 'No'}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha Estimada de Entrega">
          {formatDate(shipment.estimatedDeliveryDate)}
        </Descriptions.Item>

        <Descriptions.Item label="Fecha de Creación">
          {formatDate(shipment.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Última Actualización">
          {formatDate(shipment.updatedAt)}
        </Descriptions.Item>

        <Descriptions.Item label="Dirección de Envío" span={2}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {shippingAddressStr}
          </pre>
        </Descriptions.Item>

        {shipment.notes && (
          <Descriptions.Item label="Notas" span={2}>
            {shipment.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Card title={<Title level={5}>Historial de Tracking</Title>} size="small">
        <TrackingEventsTimeline shipmentId={shipment.id} />
      </Card>
    </Modal>
  );
};
