import { Card, Typography, Input, Select, Button, Space } from 'antd';
import { IconRefresh, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useRmas } from '../hooks/useRmas';
import { useRmaMutations } from '../hooks/useRmaMutations';
import { RmaList } from '../components/RmaList';
import { RmaDetailModal } from '../components/RmaDetailModal';
import { CreateRmaModal } from '../components/CreateRmaModal';
import { RMA_STATUS_LABELS } from '../constants/rmaConstants';
import type { RmaStatus, CreateRmaRequest } from '@types';

const { Title, Text } = Typography;
export const RmaListPage = () => {
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
  } = useRmas();

  const { createRma, cancelRma, isCreating, isCancelling } = useRmaMutations();

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRmaId, setSelectedRmaId] = useState<number | null>(null);

  const [createRmaModalOpen, setCreateRmaModalOpen] = useState(false);

  const handleViewDetail = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setDetailModalOpen(true);
  };

  const handleCancel = async (rmaId: number) => {
    try {
      await cancelRma({ rmaId });
    } catch {
      // Error handled in hook
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRmaId(null);
  };

  const handleCreateRma = async (values: CreateRmaRequest) => {
    try {
      await createRma(values);
      setCreateRmaModalOpen(false);
      refetch();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Devoluciones (RMA)
          </Title>
          <Text type="secondary">
            Gestión de devoluciones y autorización de mercancía retornada. Aprueba, inspecciona y procesa reembolsos.
          </Text>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: 16 }}>
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space size="middle" wrap>
              <Input
                placeholder="Buscar por N° RMA, N° Pedido o cliente..."
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
                  ...Object.entries(RMA_STATUS_LABELS).map(([value, label]) => ({
                    label,
                    value: value as RmaStatus,
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

            <Button
              type="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setCreateRmaModalOpen(true)}
            >
              Nueva devolución
            </Button>
          </Space>
        </div>

        {/* Table */}
        <RmaList
          data={data?.content}
          loading={isLoading || isCancelling}
          page={page}
          pageSize={pageSize}
          totalElements={data?.totalElements || 0}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
          onCancel={handleCancel}
        />
      </Card>

      {/* Modals */}
      <RmaDetailModal
        rmaId={selectedRmaId}
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
      />

      <CreateRmaModal
        open={createRmaModalOpen}
        onClose={() => setCreateRmaModalOpen(false)}
        onSubmit={handleCreateRma}
        isLoading={isCreating}
      />
    </>
  );
};
