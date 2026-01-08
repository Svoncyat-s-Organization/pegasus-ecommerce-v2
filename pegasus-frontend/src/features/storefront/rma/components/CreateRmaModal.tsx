import { Modal, Form, Select, Table, InputNumber, Input, Typography, Space, Alert } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@shared/hooks/useDebounce';
import { getMyOrders, getMyOrderById } from '@features/storefront/profile/api/ordersApi';
import { getRmasByOrder } from '../api/rmasApi';
import type { CreateRmaRequest, OrderItemResponse, OrderSummaryResponse, RmaReason } from '@types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CreateRmaModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: CreateRmaRequest) => Promise<void>;
    isLoading: boolean;
}

type ReturnItemDraft = {
    orderItemId: number;
    variantId: number;
    sku: string;
    productName: string;
    purchasedQuantity: number;
    returnQuantity: number;
};

/**
 * Modal para crear solicitudes de devolución desde el storefront
 * Similar al modal de backoffice pero sin opciones de aprobación
 * Los estados se actualizan desde el backoffice
 */
export const CreateRmaModal = ({ open, onClose, onSubmit, isLoading }: CreateRmaModalProps) => {
    const [form] = Form.useForm();
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
    const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});

    const debouncedOrderSearch = useDebounce(orderSearch, 400);

    // Obtener pedidos entregados del cliente
    const { data: deliveredOrdersPage, isFetching: isLoadingOrders } = useQuery({
        queryKey: ['storefront', 'delivered-orders', debouncedOrderSearch],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: '0',
                size: '50',
                sort: 'createdAt,desc',
                status: 'DELIVERED',
            });
            if (debouncedOrderSearch) {
                params.append('search', debouncedOrderSearch);
            }
            const response = await getMyOrders(0, 50);

            // Filtrar solo pedidos entregados
            const deliveredOrders = response.content.filter((o: OrderSummaryResponse) => o.status === 'DELIVERED');

            // Verificar elegibilidad (sin RMAs existentes)
            const eligibility = await Promise.all(
                deliveredOrders.map(async (o: OrderSummaryResponse) => {
                    try {
                        const rmasPage = await getRmasByOrder(o.id, 0, 1);
                        return { order: o, eligible: (rmasPage.totalElements ?? 0) === 0 };
                    } catch {
                        return { order: o, eligible: false };
                    }
                })
            );

            return eligibility.filter((x) => x.eligible).map((x) => x.order);
        },
        enabled: open,
    });

    // Obtener detalle del pedido seleccionado
    const { data: orderDetail, isFetching: isLoadingOrderDetail } = useQuery({
        queryKey: ['storefront', 'order', selectedOrderId],
        queryFn: () => getMyOrderById(selectedOrderId!),
        enabled: open && !!selectedOrderId,
    });

    const orderOptions = useMemo(() => {
        const content = deliveredOrdersPage ?? [];
        return content.map((o: OrderSummaryResponse) => ({
            value: o.id,
            label: `Pedido ${o.orderNumber} - ${new Date(o.createdAt).toLocaleDateString()}`,
        }));
    }, [deliveredOrdersPage]);

    const orderItems: ReturnItemDraft[] = useMemo(() => {
        if (!orderDetail) return [];
        return (orderDetail.items ?? []).map((it: OrderItemResponse) => ({
            orderItemId: it.id,
            variantId: it.variantId,
            sku: it.sku,
            productName: it.productName,
            purchasedQuantity: it.quantity,
            returnQuantity: returnQuantities[it.id] ?? 0,
        }));
    }, [orderDetail, returnQuantities]);

    const handleOrderChange = (orderId: number) => {
        setSelectedOrderId(orderId);
        setReturnQuantities({});
        form.setFieldsValue({ orderId });
    };

    const handleQuantityChange = (orderItemId: number, value: number | null) => {
        const qty = value ?? 0;
        setReturnQuantities((prev) => ({ ...prev, [orderItemId]: qty }));
    };

    const canSubmit = useMemo(() => {
        return orderItems.some((it) => it.returnQuantity > 0);
    }, [orderItems]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (!canSubmit) {
                form.setFields([
                    {
                        name: 'items',
                        errors: ['Seleccione al menos un producto con cantidad a devolver'],
                    },
                ]);
                return;
            }

            const request: CreateRmaRequest = {
                orderId: values.orderId,
                reason: values.reason as RmaReason,
                customerComments: values.customerComments || undefined,
                items: orderItems
                    .filter((it) => it.returnQuantity > 0)
                    .map((it) => ({
                        orderItemId: it.orderItemId,
                        variantId: it.variantId,
                        quantity: it.returnQuantity,
                    })),
            };

            await onSubmit(request);
            handleCancel();
        } catch {
            // handled in parent or form
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setOrderSearch('');
        setSelectedOrderId(undefined);
        setReturnQuantities({});
        onClose();
    };

    const itemColumns = [
        {
            title: 'Producto',
            key: 'product',
            render: (_: unknown, record: ReturnItemDraft) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.productName}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SKU: {record.sku}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Comprado',
            dataIndex: 'purchasedQuantity',
            key: 'purchasedQuantity',
            width: 110,
        },
        {
            title: 'Devolver',
            key: 'returnQuantity',
            width: 150,
            render: (_: unknown, record: ReturnItemDraft) => (
                <InputNumber
                    min={0}
                    max={record.purchasedQuantity}
                    value={record.returnQuantity}
                    onChange={(v) => handleQuantityChange(record.orderItemId, v)}
                    style={{ width: '100%' }}
                />
            ),
        },
    ];

    return (
        <Modal
            title="Solicitar devolución"
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            confirmLoading={isLoading}
            okText="Enviar solicitud"
            cancelText="Cancelar"
            width={900}
            styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                    message="Instrucciones"
                    description="Selecciona el pedido entregado que deseas devolver, indica el motivo y las cantidades de cada producto. Tu solicitud será revisada por nuestro equipo."
                    type="info"
                    showIcon
                />

                <Form form={form} layout="vertical">
                    <Form.Item
                        name="orderId"
                        label="Pedido entregado"
                        rules={[{ required: true, message: 'Selecciona un pedido entregado' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Buscar por número de pedido"
                            loading={isLoadingOrders}
                            filterOption={false}
                            onSearch={setOrderSearch}
                            onChange={handleOrderChange}
                            options={orderOptions}
                            notFoundContent={
                                isLoadingOrders ? 'Cargando...' : 'No hay pedidos entregados disponibles'
                            }
                        />
                    </Form.Item>

                    {selectedOrderId && (
                        <>
                            <Form.Item
                                name="reason"
                                label="Motivo de la devolución"
                                rules={[{ required: true, message: 'Selecciona el motivo de la devolución' }]}
                            >
                                <Select placeholder="Selecciona un motivo">
                                    <Select.Option value="DEFECTIVE">Producto Defectuoso</Select.Option>
                                    <Select.Option value="WRONG_ITEM">Producto Incorrecto</Select.Option>
                                    <Select.Option value="NOT_AS_DESCRIBED">
                                        No Coincide con Descripción
                                    </Select.Option>
                                    <Select.Option value="DAMAGED_SHIPPING">Dañado en Envío</Select.Option>
                                    <Select.Option value="CHANGED_MIND">Cambié de Opinión</Select.Option>
                                    <Select.Option value="SIZE_COLOR">Talla/Color Incorrecto</Select.Option>
                                    <Select.Option value="LATE_DELIVERY">Entrega Tardía</Select.Option>
                                    <Select.Option value="OTHER">Otro Motivo</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="customerComments" label="Comentarios adicionales (opcional)">
                                <TextArea
                                    placeholder="Explica con más detalle el motivo de la devolución..."
                                    rows={3}
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            <Form.Item label="Productos a devolver" name="items">
                                <Table
                                    columns={itemColumns}
                                    dataSource={orderItems}
                                    rowKey="orderItemId"
                                    pagination={false}
                                    loading={isLoadingOrderDetail}
                                    locale={{
                                        emptyText: 'No hay productos en este pedido',
                                    }}
                                />
                            </Form.Item>

                            {!canSubmit && orderItems.length > 0 && (
                                <Alert
                                    message="Indica las cantidades a devolver"
                                    type="warning"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                />
                            )}
                        </>
                    )}
                </Form>

                <Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
                    * Una vez enviada la solicitud, nuestro equipo la revisará y te contactaremos para
                    coordinar la devolución. Puedes hacer seguimiento del estado en la sección "Mis
                    Devoluciones".
                </Paragraph>
            </Space>
        </Modal>
    );
};
