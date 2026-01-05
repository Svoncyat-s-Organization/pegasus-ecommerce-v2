import { Modal, Descriptions, Tag } from 'antd';
import { useWarehouseDetail } from '../hooks/useWarehouseDetail';
import dayjs from 'dayjs';

interface WarehouseDetailModalProps {
  warehouseId: number | null;
  open: boolean;
  onClose: () => void;
}

export const WarehouseDetailModal = ({ warehouseId, open, onClose }: WarehouseDetailModalProps) => {
  const { data: warehouse, isLoading } = useWarehouseDetail(warehouseId);

  return (
    <Modal
      title="Detalles del Almacén"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {isLoading ? (
        <p>Cargando...</p>
      ) : warehouse ? (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Código" span={1}>
            {warehouse.code}
          </Descriptions.Item>
          <Descriptions.Item label="Estado" span={1}>
            <Tag color={warehouse.isActive ? 'green' : 'red'}>
              {warehouse.isActive ? 'Activo' : 'Inactivo'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nombre" span={2}>
            {warehouse.name}
          </Descriptions.Item>
          <Descriptions.Item label="Ubigeo" span={1}>
            {warehouse.ubigeoId}
          </Descriptions.Item>
          <Descriptions.Item label="Dirección" span={2}>
            {warehouse.address}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Creación" span={1}>
            {dayjs(warehouse.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Última Actualización" span={1}>
            {dayjs(warehouse.updatedAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>No se encontró el almacén</p>
      )}
    </Modal>
  );
};
