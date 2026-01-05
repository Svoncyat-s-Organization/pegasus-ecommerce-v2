import { useState } from 'react';
import { Card, Typography } from 'antd';
import { ShippingMethodsList } from '../components/ShippingMethodsList';
import { ShippingMethodFormModal } from '../components/ShippingMethodFormModal';
import { ShippingMethodViewModal } from '../components/ShippingMethodViewModal';
import {
  useShippingMethodById,
  useCreateShippingMethod,
  useUpdateShippingMethod,
} from '../hooks/useShippingMethods';
import type { CreateShippingMethodRequest, UpdateShippingMethodRequest } from '@types';

const { Title, Text } = Typography;

export const ShippingMethodsListPage = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: selectedShippingMethod } = useShippingMethodById(selectedId || 0);
  const createMutation = useCreateShippingMethod();
  const updateMutation = useUpdateShippingMethod();

  const handleCreate = () => {
    setSelectedId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedId(id);
    setIsFormModalOpen(true);
  };

  const handleView = (id: number) => {
    setSelectedId(id);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (
    values: CreateShippingMethodRequest | UpdateShippingMethodRequest
  ) => {
    if (selectedId) {
      await updateMutation.mutateAsync({
        id: selectedId,
        request: values as UpdateShippingMethodRequest,
      });
    } else {
      await createMutation.mutateAsync(values as CreateShippingMethodRequest);
    }
    setIsFormModalOpen(false);
    setSelectedId(null);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setSelectedId(null);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setSelectedId(null);
  };

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Métodos de Envío
        </Title>
        <Text type="secondary">
          Gestión de métodos de envío. Configure transportistas, costos y tiempos de entrega.
        </Text>
      </div>

      <ShippingMethodsList onEdit={handleEdit} onCreate={handleCreate} onView={handleView} />

      <ShippingMethodFormModal
        open={isFormModalOpen}
        onCancel={handleFormCancel}
        onSubmit={handleFormSubmit}
        initialValues={selectedId ? selectedShippingMethod : undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ShippingMethodViewModal
        open={isViewModalOpen}
        onClose={handleViewClose}
        shippingMethod={selectedShippingMethod}
      />
    </Card>
  );
};
