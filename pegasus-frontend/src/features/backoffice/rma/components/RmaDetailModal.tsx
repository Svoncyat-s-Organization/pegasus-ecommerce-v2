import { Modal, Descriptions, Table, Tag, Timeline, Spin, Alert, Button, Space } from 'antd';
import type { RmaItemResponse, RmaStatusHistoryResponse } from '@types';
import { useRmaDetail } from '../hooks/useRmaDetail';
import {
  RMA_STATUS_LABELS,
  RMA_STATUS_COLORS,
  RMA_REASON_LABELS,
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_COLORS,
  REFUND_METHOD_LABELS,
  isActionAvailable,
} from '../constants/rmaConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface RmaDetailModalProps {
  rmaId: number | null;
  open: boolean;
  onClose: () => void;
  onMarkReceived?: (rmaId: number) => void;
  onInspect?: (rmaId: number) => void;
  onCompleteInspection?: (rmaId: number) => void;
  onProcessRefund?: (rmaId: number) => void;
  onCloseRmaAction?: (rmaId: number) => void;
}

export const RmaDetailModal = ({
  rmaId,
  open,
  onClose,
  onMarkReceived,
  onInspect,
  onCompleteInspection,
  onProcessRefund,
  onCloseRmaAction,
}: RmaDetailModalProps) => {
  const { data: rma, isLoading, error } = useRmaDetail(rmaId);

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
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
  ];

  const renderActions = () => {
    if (!rma) return null;

    const actions: React.ReactNode[] = [];

    if (isActionAvailable(rma.status, 'mark-received') && onMarkReceived) {
      actions.push(
        <Button key="received" type="primary" onClick={() => onMarkReceived(rma.id)}>
          Marcar como Recibido
        </Button>
      );
    }

    if (isActionAvailable(rma.status, 'inspect-items') && onInspect) {
      actions.push(
        <Button key="inspect" type="primary" onClick={() => onInspect(rma.id)}>
          Inspeccionar Items
        </Button>
      );
    }

    if (rma.status === 'INSPECTING' && onCompleteInspection) {
      actions.push(
        <Button key="complete" type="primary" onClick={() => onCompleteInspection(rma.id)}>
          Completar Inspección
        </Button>
      );
    }

    if (rma.status === 'INSPECTING' && rma.items.every(item => item.itemCondition) && onProcessRefund) {
      actions.push(
        <Button key="refund" type="primary" style={{ background: '#722ed1' }} onClick={() => onProcessRefund(rma.id)}>
          Procesar Reembolso
        </Button>
      );
    }

    if (isActionAvailable(rma.status, 'close') && onCloseRmaAction) {
      actions.push(
        <Button key="close" type="primary" style={{ background: '#52c41a' }} onClick={() => onCloseRmaAction(rma.id)}>
          Cerrar RMA
        </Button>
      );
    }

    return actions.length > 0 ? <Space>{actions}</Space> : null;
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
        renderActions(),
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

          {/* Historial de Estados */}
          {rma.statusHistories.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Historial de Estados</h3>
              <Timeline
                items={rma.statusHistories.map((history: RmaStatusHistoryResponse) => ({
                  color: RMA_STATUS_COLORS[history.status],
                  children: (
                    <div>
                      <div>
                        <Tag color={RMA_STATUS_COLORS[history.status]}>
                          {RMA_STATUS_LABELS[history.status]}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                        {dayjs(history.changedAt).format('DD/MM/YYYY HH:mm')} por {history.changedByUsername}
                      </div>
                      {history.comments && (
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <strong>Comentarios:</strong> {history.comments}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
