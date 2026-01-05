import { useState } from 'react';
import { Card, Typography, message } from 'antd';
import { ShipmentsList } from '../components/ShipmentsList';
import { ShipmentFormModal } from '../components/ShipmentFormModal';
import { ShipmentViewModal } from '../components/ShipmentViewModal';
import { useCreateShipment, useUpdateShipment, useDeleteShipment, useShipmentById } from '../hooks/useShipments';
import type { CreateShipmentRequest, Shipment } from '@types';

const { Title, Text } = Typography;

export const ShipmentsListPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null);

  const createMutation = useCreateShipment();
  const updateMutation = useUpdateShipment();
  const deleteMutation = useDeleteShipment();
  const { data: selectedShipment } = useShipmentById(selectedShipmentId || 0);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedShipmentId(id);
    setIsEditModalOpen(true);
  };

  const handleView = (id: number) => {
    setSelectedShipmentId(id);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Envío eliminado exitosamente');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar el envío');
    }
  };

  const handleCreateSubmit = async (values: CreateShipmentRequest) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Envío creado exitosamente');
      setIsCreateModalOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear el envío');
    }
  };

  const handleUpdateSubmit = async (values: CreateShipmentRequest) => {
    if (!selectedShipmentId) return;
    try {
      await updateMutation.mutateAsync({ id: selectedShipmentId, request: values });
      message.success('Envío actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedShipmentId(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar el envío');
    }
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedShipmentId(null);
  };

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Envíos
        </Title>
        <Text type="secondary">
          Gestión de envíos de órdenes y devoluciones. Realiza seguimiento de tracking, actualiza estados y administra la logística de entregas.
        </Text>
      </div>

      <ShipmentsList
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <ShipmentFormModal
        open={isCreateModalOpen}
        onCancel={handleCloseModals}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <ShipmentFormModal
        open={isEditModalOpen}
        onCancel={handleCloseModals}
        onSubmit={handleUpdateSubmit}
        initialValues={selectedShipment as Shipment}
        isLoading={updateMutation.isPending}
      />

      <ShipmentViewModal
        open={isViewModalOpen}
        onClose={handleCloseModals}
        shipment={selectedShipment || null}
      />
    </Card>
  );
};
