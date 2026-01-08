import { Modal, Descriptions, Table, Tag, Spin, Alert, Button } from 'antd';
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
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <RmaStatusTimeline currentStatus={rma.status} />
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
                            <Descriptions.Item label="Notas del Personal" span={2}>
                                <Alert
                                    message={rma.staffNotes}
                                    type="info"
                                    showIcon
                                    style={{ marginTop: 8 }}
                                />
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
                        {rma.refundMethod && (
                            <Descriptions.Item label="Método de Reembolso" span={2}>
                                <Tag color="blue">
                                    {REFUND_METHOD_LABELS[rma.refundMethod]}
                                </Tag>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Total a Reembolsar" span={2}>
                            <strong style={{ fontSize: 18, color: '#52c41a' }}>
                                {formatCurrency(rma.refundAmount - rma.restockingFee)}
                            </strong>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Items de Devolución */}
                    <div style={{ marginBottom: 16 }}>
                        <h3>Items de Devolución</h3>
                    </div>
                    <Table
                        columns={itemColumns}
                        dataSource={rma.items}
                        rowKey="id"
                        pagination={false}
                        bordered
                    />
                </div>
            )}
        </Modal>
    );
};
