import { useState } from 'react';
import { Card, Typography, Input, Select, Button } from 'antd';
import { IconRefresh, IconPlus } from '@tabler/icons-react';
import { useWarehouses } from '../hooks/useWarehouses';
import { useWarehouseMutations } from '../hooks/useWarehouseMutations';
import { WarehouseList } from '../components/WarehouseList';
import { WarehouseDetailModal } from '../components/WarehouseDetailModal';
import { WarehouseFormModal } from '../components/WarehouseFormModal';
import type { WarehouseResponse, CreateWarehouseRequest, UpdateWarehouseRequest } from '@types';

const { Title, Text } = Typography;

export const WarehouseListPage = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponse | null>(null);

  const {
    data,
    isLoading,
    refetch,
    page,
    pageSize,
    searchTerm,
    activeFilter,
    handleSearch,
    handleActiveFilter,
    handlePageChange,
  } = useWarehouses();

  const {
    createWarehouse,
    updateWarehouse,
    toggleStatus,
    deleteWarehouse,
    isCreating,
    isUpdating,
  } = useWarehouseMutations();

  const handleView = (warehouse: WarehouseResponse) => {
    setSelectedWarehouseId(warehouse.id);
    setDetailModalOpen(true);
  };

  const handleEdit = (warehouse: WarehouseResponse) => {
    setEditingWarehouse(warehouse);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingWarehouse(null);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (values: CreateWarehouseRequest | UpdateWarehouseRequest) => {
    if (editingWarehouse) {
      await updateWarehouse({ id: editingWarehouse.id, request: values });
    } else {
      await createWarehouse(values as CreateWarehouseRequest);
    }
  };

  const handleToggleStatus = async (id: number) => {
    await toggleStatus(id);
  };

  const handleDelete = async (id: number) => {
    await deleteWarehouse(id);
  };

  return (
    <Card>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Almacenes
        </Title>
        <Text type="secondary">
          Gestión de almacenes y ubicaciones físicas para el inventario.
        </Text>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          <Input
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
          />

          <Select
            placeholder="Estado"
            value={activeFilter}
            onChange={handleActiveFilter}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]}
          />

          <Button icon={<IconRefresh size={16} />} onClick={() => refetch()}>
            Actualizar
          </Button>
        </div>

        <Button type="primary" icon={<IconPlus size={16} />} onClick={handleCreate}>
          Nuevo Almacén
        </Button>
      </div>

      {/* Table */}
      <WarehouseList
        data={data?.content || []}
        loading={isLoading}
        total={data?.totalElements || 0}
        currentPage={page + 1}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <WarehouseDetailModal
        warehouseId={selectedWarehouseId}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />

      <WarehouseFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingWarehouse}
        loading={isCreating || isUpdating}
      />
    </Card>
  );
};
