import { Card, Typography, Input, Select, Button, Space } from 'antd';
import { IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { OrderList } from '../components/OrderList';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';
import { ORDER_STATUS_LABELS } from '../constants/orderStatus';
import type { OrderStatus } from '@types';

const { Title, Text } = Typography;

export const OrderListPage = () => {
  const {
    data,
    isLoading,
    page,
    pageSize,
    searchTerm,
    statusFilter,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    refetch,
  } = useOrders();

  const { cancelOrder, isCancelling } = useOrderMutations();

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | null>(null);

  const handleViewDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    setDetailModalOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder({ orderId });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleCloseUpdateStatusModal = () => {
    setUpdateStatusModalOpen(false);
    setSelectedOrderId(null);
    setSelectedOrderStatus(null);
  };

  return (
    <>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Pedidos
          </Title>
          <Text type="secondary">
            Gestión de pedidos del sistema. Visualiza, actualiza estados y gestiona las órdenes de compra.
          </Text>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: 16 }}>
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space size="middle" wrap>
              <Input
                placeholder="Buscar por N° pedido, cliente o email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                style={{ width: 350 }}
              />
              <Select
                placeholder="Filtrar por estado"
                value={statusFilter}
                onChange={handleStatusFilter}
                allowClear
                style={{ width: 180 }}
                options={[
                  { label: 'Todos los estados', value: undefined },
                  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
                    label,
                    value: value as OrderStatus,
                  })),
                ]}
              />
              <Button
                icon={<IconRefresh size={16} />}
                onClick={() => refetch()}
                title="Actualizar lista"
              >
                Actualizar
              </Button>
            </Space>

            {/* Placeholder for Create Order button (future feature) */}
            {/* <Button type="primary" icon={<IconPlus size={16} />}>
              Nuevo Pedido
            </Button> */}
          </Space>
        </div>

        {/* Table */}
        <OrderList
          data={data?.content}
          loading={isLoading || isCancelling}
          page={page}
          pageSize={pageSize}
          totalElements={data?.totalElements || 0}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
          onCancel={handleCancelOrder}
        />
      </Card>

      {/* Modals */}
      <OrderDetailModal
        orderId={selectedOrderId}
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
      />

      <UpdateStatusModal
        orderId={selectedOrderId}
        currentStatus={selectedOrderStatus}
        open={updateStatusModalOpen}
        onClose={handleCloseUpdateStatusModal}
      />
    </>
  );
};
