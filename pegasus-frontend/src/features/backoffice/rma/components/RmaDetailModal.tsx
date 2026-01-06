import { Modal, Descriptions, Table, Tag, Spin, Alert, Button, Input, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import type { RmaItemResponse, RefundMethod } from '@types';
// Icons are rendered inside RmaStatusTimeline
import { useRmaDetail } from '../hooks/useRmaDetail';
import { useRmaMutations } from '../hooks/useRmaMutations';
import { ApprovalModal } from './ApprovalModal';
import { InspectionModal } from './InspectionModal';
import { RmaStatusTimeline } from './RmaStatusTimeline';
import {
  RMA_STATUS_LABELS,
  RMA_STATUS_COLORS,
  RMA_REASON_LABELS,
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_COLORS,
  REFUND_METHOD_LABELS,
} from '../constants/rmaConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface RmaDetailModalProps {
  rmaId: number | null;
  open: boolean;
  onClose: () => void;
}

export const RmaDetailModal = ({
  rmaId,
  open,
  onClose,
}: RmaDetailModalProps) => {
  const DEFAULT_WAREHOUSE_ID = 1;
  const { data: rma, isLoading, error } = useRmaDetail(rmaId);
  const {
    markInTransit,
    markReceived,
    inspectItem,
    updateRma,
    processRefund,
    closeRma,
    isMarkingInTransit,
    isMarkingReceived,
    isInspecting,
    isUpdating,
    isProcessingRefund,
    isClosing,
  } = useRmaMutations();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const [markInTransitOpen, setMarkInTransitOpen] = useState(false);
  const [markReceivedOpen, setMarkReceivedOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [refundDecisionOpen, setRefundDecisionOpen] = useState(false);
  const [closeRmaOpen, setCloseRmaOpen] = useState(false);

  const [comments, setComments] = useState('');
  const [refundMethod, setRefundMethod] = useState<RefundMethod | undefined>(undefined);

  // Visual status timeline is handled by RmaStatusTimeline

  const isSpecialStatus = rma?.status === 'REJECTED' || rma?.status === 'CANCELLED';


  const uninspectedItems = useMemo(() => {
    if (!rma) return [];
    return rma.items.filter((i) => !i.itemCondition);
  }, [rma]);

  const canAdvance = useMemo(() => {
    if (!rma) return false;
    if (isSpecialStatus) return false;
    return rma.status !== 'CLOSED';
  }, [isSpecialStatus, rma]);

  const resetActionState = () => {
    setComments('');
    setRefundMethod(undefined);
  };

  const handleAdvance = () => {
    if (!rma) return;

    switch (rma.status) {
      case 'PENDING':
        setApprovalModalOpen(true);
        return;
      case 'APPROVED':
        setMarkInTransitOpen(true);
        return;
      case 'IN_TRANSIT':
        setMarkReceivedOpen(true);
        return;
      case 'RECEIVED':
        setInspectionModalOpen(true);
        return;
      case 'INSPECTING':
        if (uninspectedItems.length > 0) {
          setInspectionModalOpen(true);
          return;
        }
        setRefundDecisionOpen(true);
        return;
      case 'REFUNDED':
        setCloseRmaOpen(true);
        return;
      default:
        return;
    }
  };

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: RmaItemResponse, index: number) => index + 1,
    },
    {
      title: 'Producto',
      key: 'product',
      render: (item: RmaItemResponse) => (
        <div>
          <div style={{ fontWeight: 500 }}>{item.productName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>SKU: {item.variantSku}</div>
        </div>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Condición',
      dataIndex: 'itemCondition',
      key: 'itemCondition',
      width: 150,
      render: (condition: string | null) =>
        condition ? (
          <Tag color={ITEM_CONDITION_COLORS[condition as keyof typeof ITEM_CONDITION_COLORS]}>
            {ITEM_CONDITION_LABELS[condition as keyof typeof ITEM_CONDITION_LABELS]}
          </Tag>
        ) : (
          <Tag color="default">Sin Inspeccionar</Tag>
        ),
    },
    {
      title: 'Reembolso',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 120,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Restock',
      dataIndex: 'restockApproved',
      key: 'restockApproved',
      width: 100,
      render: (approved: boolean | null) => {
        if (approved === null) return <Tag color="default">Pendiente</Tag>;
        return approved ? (
          <Tag color="success">Sí</Tag>
        ) : (
          <Tag color="error">No</Tag>
        );
      },
    },
    {
      title: 'Acción',
      key: 'action',
      width: 120,
      render: (item: RmaItemResponse) => {
        const isInInspection = rma?.status === 'RECEIVED' || rma?.status === 'INSPECTING';
        if (!isInInspection) return null;
        return item.itemCondition ? <Tag color="success">Listo</Tag> : <Tag color="default">Pendiente</Tag>;
      },
    },
  ];

  const confirmMarkInTransit = async () => {
    if (!rma) return;
    try {
      await markInTransit({ rmaId: rma.id, comments });
      setMarkInTransitOpen(false);
      resetActionState();
    } catch {
      // handled in hook
    }
  };

  const confirmMarkReceived = async () => {
    if (!rma) return;
    try {
      await markReceived({ rmaId: rma.id });
      setMarkReceivedOpen(false);
      resetActionState();
    } catch {
      // handled in hook
    }
  };

  const confirmRefundDecision = async () => {
    if (!rma) return;
    if (!refundMethod) {
      message.warning('Seleccione un método');
      return;
    }

    try {
      await updateRma({ rmaId: rma.id, request: { refundMethod } });
      await processRefund({ rmaId: rma.id, comments });
      setRefundDecisionOpen(false);
      resetActionState();
    } catch {
      // handled in hook
    }
  };

  const confirmCloseRma = async () => {
    if (!rma) return;
    try {
      await closeRma({ rmaId: rma.id, warehouseId: DEFAULT_WAREHOUSE_ID, comments });
      setCloseRmaOpen(false);
      resetActionState();
    } catch {
      // handled in hook
    }
  };

  return (
    <Modal
      title="Detalle del RMA"
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description="No se pudo cargar el detalle del RMA"
          type="error"
          showIcon
        />
      )}

      {rma && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <RmaStatusTimeline
              currentStatus={rma.status}
              canAdvance={canAdvance}
              onAdvance={handleAdvance}
            />
          </div>

          {/* Información General */}
          <Descriptions title="Información General" bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="N° RMA" span={2}>
              <strong>{rma.rmaNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="N° Pedido">
              <strong>{rma.orderNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={RMA_STATUS_COLORS[rma.status]}>
                {RMA_STATUS_LABELS[rma.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cliente" span={2}>
              <div>
                <div style={{ fontWeight: 500 }}>{rma.customerName}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{rma.customerEmail}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Motivo" span={2}>
              {RMA_REASON_LABELS[rma.reason]}
            </Descriptions.Item>
            {rma.customerComments && (
              <Descriptions.Item label="Comentarios Cliente" span={2}>
                {rma.customerComments}
              </Descriptions.Item>
            )}
            {rma.staffNotes && (
              <Descriptions.Item label="Notas Staff" span={2}>
                {rma.staffNotes}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Información de Reembolso */}
          <Descriptions title="Información de Reembolso" bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Monto Reembolso">
              <strong style={{ fontSize: 16, color: '#722ed1' }}>
                {formatCurrency(rma.refundAmount)}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Tarifa Restock">
              {formatCurrency(rma.restockingFee)}
            </Descriptions.Item>
            <Descriptions.Item label="Costo Envío">
              {formatCurrency(rma.shippingCostRefund)}
            </Descriptions.Item>
            {rma.refundMethod && (
              <Descriptions.Item label="Método Reembolso">
                {REFUND_METHOD_LABELS[rma.refundMethod]}
              </Descriptions.Item>
            )}
            {rma.approverName && (
              <>
                <Descriptions.Item label="Aprobado Por">
                  {rma.approverName}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha Aprobación">
                  {dayjs(rma.approvedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>

          {/* Items del RMA */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Items Devueltos</h3>
            <Table
              columns={itemColumns}
              dataSource={rma.items}
              rowKey="id"
              pagination={false}
              bordered
              size="small"
            />
          </div>
        </div>
      )}

      <ApprovalModal
        rmaId={rmaId}
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      />

      <Modal
        title="Cliente envió el paquete"
        open={markInTransitOpen}
        onOk={confirmMarkInTransit}
        onCancel={() => {
          setMarkInTransitOpen(false);
          resetActionState();
        }}
        confirmLoading={isMarkingInTransit}
      >
        <Input.TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Modal>

      <Modal
        title="Marcar como recibido"
        open={markReceivedOpen}
        onOk={confirmMarkReceived}
        onCancel={() => {
          setMarkReceivedOpen(false);
          resetActionState();
        }}
        confirmLoading={isMarkingReceived}
      >
        ¿Confirmar que el paquete fue recibido?
      </Modal>

      {rma && (
        <InspectionModal
          open={inspectionModalOpen}
          rma={rma}
          uninspectedItems={uninspectedItems}
          onClose={() => setInspectionModalOpen(false)}
          onInspectItem={inspectItem}
          isInspecting={isInspecting}
        />
      )}

      <Modal
        title="Decidir reembolso"
        open={refundDecisionOpen}
        onOk={confirmRefundDecision}
        onCancel={() => {
          setRefundDecisionOpen(false);
          resetActionState();
        }}
        confirmLoading={isUpdating || isProcessingRefund}
      >
        <div style={{ marginBottom: 12 }}>
          <strong>Monto:</strong> {rma ? formatCurrency(rma.refundAmount) : ''}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Método:</label>
          <Select
            value={refundMethod}
            onChange={(v) => setRefundMethod(v)}
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Seleccione un método"
            options={Object.entries(REFUND_METHOD_LABELS)
              .filter(([value]) => value !== 'EXCHANGE')
              .map(([value, label]) => ({
                value,
                label,
              }))}
          />
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Modal>

      <Modal
        title="Cerrar RMA"
        open={closeRmaOpen}
        onOk={confirmCloseRma}
        onCancel={() => {
          setCloseRmaOpen(false);
          resetActionState();
        }}
        confirmLoading={isClosing}
      >
        <div style={{ marginBottom: 12 }}>
          ¿Confirmar el cierre de la devolución?
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Comentarios opcionales..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Modal>
    </Modal>
  );
};
