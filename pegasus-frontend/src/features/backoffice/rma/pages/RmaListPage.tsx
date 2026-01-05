import { Card, Typography, Input, Select, Button, Space, Modal, message } from 'antd';
import { IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { useRmas } from '../hooks/useRmas';
import { useRmaMutations } from '../hooks/useRmaMutations';
import { RmaList } from '../components/RmaList';
import { RmaDetailModal } from '../components/RmaDetailModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { InspectItemModal } from '../components/InspectItemModal';
import { RMA_STATUS_LABELS } from '../constants/rmaConstants';
import type { RmaStatus, RmaItemResponse } from '@types';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

  const {
    approveReject,
    markReceived,
    completeInspection,
    processRefund,
    closeRma,
    cancelRma,
    isApproving,
    isMarkingReceived,
    isCompletingInspection,
    isProcessingRefund,
    isClosing,
    isCancelling,
  } = useRmaMutations();

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedRmaId, setSelectedRmaId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<RmaItemResponse | null>(null);

  // Action modals
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [completeInspectionModalOpen, setCompleteInspectionModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [closeRmaModalOpen, setCloseRmaModalOpen] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [warehouseId, setWarehouseId] = useState<number>(1); // Default warehouse

  const handleViewDetail = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setDetailModalOpen(true);
  };

  const handleApprove = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setApprovalModalOpen(true);
  };

  const handleReject = async (rmaId: number) => {
    try {
      await approveReject({
        rmaId,
        request: { approved: false, comments: 'Solicitud rechazada por staff' },
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCancel = async (rmaId: number) => {
    try {
      await cancelRma({ rmaId });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleMarkReceived = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setReceivedModalOpen(true);
  };

  const handleInspect = (rmaId: number) => {
    // In a real app, we'd fetch uninspected items and show them
    message.info('Por favor inspeccione los items desde el detalle del RMA');
    setSelectedRmaId(rmaId);
    setDetailModalOpen(true);
  };

  const handleCompleteInspection = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setCompleteInspectionModalOpen(true);
  };

  const handleProcessRefund = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setRefundModalOpen(true);
  };

  const handleCloseRmaAction = (rmaId: number) => {
    setSelectedRmaId(rmaId);
    setCloseRmaModalOpen(true);
  };

  const confirmMarkReceived = async () => {
    if (selectedRmaId) {
      try {
        await markReceived({ rmaId: selectedRmaId, comments: actionComments });
        setReceivedModalOpen(false);
        setActionComments('');
        setDetailModalOpen(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const confirmCompleteInspection = async () => {
    if (selectedRmaId) {
      try {
        await completeInspection({ rmaId: selectedRmaId, comments: actionComments });
        setCompleteInspectionModalOpen(false);
        setActionComments('');
        setDetailModalOpen(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const confirmProcessRefund = async () => {
    if (selectedRmaId) {
      try {
        await processRefund({ rmaId: selectedRmaId, comments: actionComments });
        setRefundModalOpen(false);
        setActionComments('');
        setDetailModalOpen(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const confirmCloseRma = async () => {
    if (selectedRmaId) {
      try {
        await closeRma({
          rmaId: selectedRmaId,
          warehouseId,
          comments: actionComments,
        });
        setCloseRmaModalOpen(false);
        setActionComments('');
        setDetailModalOpen(false);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRmaId(null);
  };

  const handleCloseApprovalModal = () => {
    setApprovalModalOpen(false);
    setSelectedRmaId(null);
  };

  const handleCloseInspectModal = () => {
    setInspectModalOpen(false);
    setSelectedItem(null);
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
          <Space size="middle" wrap style={{ width: '100%' }}>
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
        </div>

        {/* Table */}
        <RmaList
          data={data?.content}
          loading={isLoading || isApproving || isCancelling}
          page={page}
          pageSize={pageSize}
          totalElements={data?.totalElements || 0}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
        />
      </Card>

      {/* Modals */}
      <RmaDetailModal
        rmaId={selectedRmaId}
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        onMarkReceived={handleMarkReceived}
        onInspect={handleInspect}
        onCompleteInspection={handleCompleteInspection}
        onProcessRefund={handleProcessRefund}
        onCloseRmaAction={handleCloseRmaAction}
      />

      <ApprovalModal
        rmaId={selectedRmaId}
        open={approvalModalOpen}
        onClose={handleCloseApprovalModal}
      />

      <InspectItemModal
        item={selectedItem}
        open={inspectModalOpen}
        onClose={handleCloseInspectModal}
      />

      {/* Action Modals with Comments */}
      <Modal
        title="Marcar como Recibido"
        open={receivedModalOpen}
        onOk={confirmMarkReceived}
        onCancel={() => {
          setReceivedModalOpen(false);
          setActionComments('');
        }}
        confirmLoading={isMarkingReceived}
      >
        <TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={actionComments}
          onChange={(e) => setActionComments(e.target.value)}
        />
      </Modal>

      <Modal
        title="Completar Inspección"
        open={completeInspectionModalOpen}
        onOk={confirmCompleteInspection}
        onCancel={() => {
          setCompleteInspectionModalOpen(false);
          setActionComments('');
        }}
        confirmLoading={isCompletingInspection}
      >
        <TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={actionComments}
          onChange={(e) => setActionComments(e.target.value)}
        />
      </Modal>

      <Modal
        title="Procesar Reembolso"
        open={refundModalOpen}
        onOk={confirmProcessRefund}
        onCancel={() => {
          setRefundModalOpen(false);
          setActionComments('');
        }}
        confirmLoading={isProcessingRefund}
      >
        <TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={actionComments}
          onChange={(e) => setActionComments(e.target.value)}
        />
      </Modal>

      <Modal
        title="Cerrar RMA"
        open={closeRmaModalOpen}
        onOk={confirmCloseRma}
        onCancel={() => {
          setCloseRmaModalOpen(false);
          setActionComments('');
        }}
        confirmLoading={isClosing}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Almacén para Restock:</label>
          <Select
            value={warehouseId}
            onChange={setWarehouseId}
            style={{ width: '100%', marginTop: 8 }}
            options={[
              { label: 'Almacén Principal', value: 1 },
              { label: 'Almacén Secundario', value: 2 },
            ]}
          />
        </div>
        <TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={actionComments}
          onChange={(e) => setActionComments(e.target.value)}
        />
      </Modal>
    </>
  );
};
