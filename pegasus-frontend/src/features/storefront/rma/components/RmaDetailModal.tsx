import { Modal, Descriptions, Table, Tag, Spin, Alert } from 'antd';
import type { RmaItemResponse } from '@types';
import { useRmaDetail } from '../hooks/useRmaDetail';
import { RmaStatusTimeline } from './RmaStatusTimeline';
import {
    RMA_STATUS_LABELS,
    RMA_STATUS_COLORS,
    RMA_REASON_LABELS,
    ITEM_CONDITION_LABELS,
    ITEM_CONDITION_COLORS,
    REFUND_METHOD_LABELS,
} from '@features/backoffice/rma/constants/rmaConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface RmaDetailModalProps {
    rmaId: number | null;
    open: boolean;
    onClose: () => void;
}

/**
 * Modal de detalle de RMA para clientes (storefront)
 * Solo lectura - sin botones de acción
 * Los estados se actualizan desde el backoffice
 */
export const RmaDetailModal = ({
    rmaId,
    open,
    onClose,
}: RmaDetailModalProps) => {
    const { data: rma, isLoading, error } = useRmaDetail(rmaId);

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
                    <Tag color="default">Pendiente Inspección</Tag>
                ),
        },
        {
            title: 'Monto',
            dataIndex: 'refundAmount',
            key: 'refundAmount',
            width: 120,
            render: (amount: number) => formatCurrency(amount),
        },
    ];

    return (
        <Modal
            title="Detalle de Devolución"
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
        >
            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            )}

            {error && (
                <Alert
                    message="Error"
                    description="No se pudo cargar el detalle de la devolución"
                    type="error"
                    showIcon
                />
            )}

            {rma && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Timeline de estado */}
                    <RmaStatusTimeline currentStatus={rma.status} />

                    {/* Información General */}
                    <Descriptions title="Información General" bordered column={2}>
                        <Descriptions.Item label="N° RMA" span={1}>
                            <strong>{rma.rmaNumber}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado" span={1}>
                            <Tag color={RMA_STATUS_COLORS[rma.status]}>
                                {RMA_STATUS_LABELS[rma.status]}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="N° Pedido" span={1}>
                            {rma.orderNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de Solicitud" span={1}>
                            {dayjs(rma.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>

                        <Descriptions.Item label="Motivo" span={2}>
                            <Tag color="blue">{RMA_REASON_LABELS[rma.reason]}</Tag>
                        </Descriptions.Item>

                        {rma.customerComments && (
                            <Descriptions.Item label="Tus Comentarios" span={2}>
                                {rma.customerComments}
                            </Descriptions.Item>
                        )}

                        {rma.staffNotes && (
                            <Descriptions.Item label="Notas del Staff" span={2}>
                                <Alert message={rma.staffNotes} type="info" showIcon />
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    {/* Productos */}
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Productos a Devolver</h3>
                        <Table
                            columns={itemColumns}
                            dataSource={rma.items}
                            rowKey="id"
                            pagination={false}
                            bordered
                        />
                    </div>

                    {/* Montos */}
                    <Descriptions title="Montos" bordered column={2}>
                        <Descriptions.Item label="Subtotal Items" span={1}>
                            {formatCurrency(rma.refundAmount)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tarifa de Reposición" span={1}>
                            {formatCurrency(rma.restockingFee)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reembolso de Envío" span={1}>
                            {formatCurrency(rma.shippingCostRefund)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total a Reembolsar" span={1}>
                            <strong style={{ fontSize: 16, color: '#52c41a' }}>
                                {formatCurrency(
                                    rma.refundAmount + rma.shippingCostRefund - rma.restockingFee
                                )}
                            </strong>
                        </Descriptions.Item>

                        {rma.refundMethod && (
                            <Descriptions.Item label="Método de Reembolso" span={2}>
                                <Tag color="purple">{REFUND_METHOD_LABELS[rma.refundMethod]}</Tag>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    {/* Información de seguimiento */}
                    {(rma.approvedAt || rma.receivedAt || rma.refundedAt || rma.closedAt) && (
                        <Descriptions title="Historial" bordered column={2}>
                            {rma.approvedAt && (
                                <Descriptions.Item label="Aprobado" span={1}>
                                    {dayjs(rma.approvedAt).format('DD/MM/YYYY HH:mm')}
                                    {rma.approverName && <div>Por: {rma.approverName}</div>}
                                </Descriptions.Item>
                            )}
                            {rma.receivedAt && (
                                <Descriptions.Item label="Recibido" span={1}>
                                    {dayjs(rma.receivedAt).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                            )}
                            {rma.refundedAt && (
                                <Descriptions.Item label="Reembolsado" span={1}>
                                    {dayjs(rma.refundedAt).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                            )}
                            {rma.closedAt && (
                                <Descriptions.Item label="Cerrado" span={1}>
                                    {dayjs(rma.closedAt).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    )}
                </div>
            )}
        </Modal>
    );
};
