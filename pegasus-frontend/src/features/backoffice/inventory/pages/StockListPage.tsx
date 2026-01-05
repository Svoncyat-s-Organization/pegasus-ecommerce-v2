import { useState } from 'react';
import { Card, Typography, Select, Button } from 'antd';
import { IconRefresh } from '@tabler/icons-react';
import { useStock } from '../hooks/useStock';
import { useStockMutations } from '../hooks/useStockMutations';
import { useActiveWarehouses } from '../hooks/useWarehouseDetail';
import { StockList } from '../components/StockList';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { TransferStockModal } from '../components/TransferStockModal';
import type { StockResponse } from '@types';

const { Title, Text } = Typography;

export const StockListPage = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockResponse | null>(null);

  const { data: warehouses } = useActiveWarehouses();
  const { data, isLoading, refetch, page, pageSize, handlePageChange } = useStock(
    selectedWarehouseId
  );

  const { adjustStock, transferStock, isAdjusting, isTransferring } = useStockMutations();

  const handleWarehouseChange = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
  };

  const handleAdjustSubmit = async (values: { quantityChange: number; reason: string }) => {
    if (!selectedStock) return;
    await adjustStock({
      variantId: selectedStock.variantId,
      warehouseId: selectedStock.warehouseId,
      quantityChange: values.quantityChange,
      reason: values.reason,
    });
    setAdjustModalOpen(false);
    setSelectedStock(null);
  };

  const handleTransferSubmit = async (values: {
    fromWarehouseId: number;
    toWarehouseId: number;
    quantity: number;
    reason?: string;
  }) => {
    if (!selectedStock) return;
    await transferStock({
      variantId: selectedStock.variantId,
      fromWarehouseId: values.fromWarehouseId,
      toWarehouseId: values.toWarehouseId,
      quantity: values.quantity,
      reason: values.reason,
    });
    setTransferModalOpen(false);
    setSelectedStock(null);
  };

  return (
    <Card>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Stock por Almacén
        </Title>
        <Text type="secondary">
          Consulta de inventario disponible, reservado y total por almacén.
        </Text>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Text strong>Almacén:</Text>
        <Select
          placeholder="Seleccione un almacén"
          value={selectedWarehouseId}
          onChange={handleWarehouseChange}
          style={{ width: 300 }}
          options={warehouses?.map((w) => ({
            label: `${w.code} - ${w.name}`,
            value: w.id,
          }))}
          showSearch
          optionFilterProp="label"
        />

        <Button
          icon={<IconRefresh size={16} />}
          onClick={() => refetch()}
          disabled={!selectedWarehouseId}
        >
          Actualizar
        </Button>
      </div>

      {/* Info Message */}
      {!selectedWarehouseId && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Text type="secondary">Seleccione un almacén para ver el stock</Text>
        </div>
      )}

      {/* Table */}
      {selectedWarehouseId && (
        <StockList
          data={data?.content || []}
          loading={isLoading}
          total={data?.totalElements || 0}
          currentPage={page + 1}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <AdjustStockModal
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onSubmit={handleAdjustSubmit}
        loading={isAdjusting}
      />

      <TransferStockModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSubmit={handleTransferSubmit}
        loading={isTransferring}
      />
    </Card>
  );
};
