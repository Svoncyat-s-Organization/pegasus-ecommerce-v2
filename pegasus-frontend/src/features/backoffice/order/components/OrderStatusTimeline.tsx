import { Card, Button, Space, Typography, Tag, Modal, message } from 'antd';
import {
  IconClock,
  IconCreditCard,
  IconCash,
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconX,
  IconRefresh,
  IconChevronRight,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type { OrderResponse, CreateShipmentRequest, Shipment } from '@types';
import type { ReactNode } from 'react';
import { useAdvanceOrderStatus } from '../hooks/useAdvanceOrderStatus';
import { PaymentFormModal } from '@features/backoffice/invoice/components/PaymentFormModal';
import { InvoiceFormModal } from '@features/backoffice/invoice/components/InvoiceFormModal';
import { useInvoicedOrderIds } from '@features/backoffice/invoice/hooks/useBillingInvoices';
import { ShipmentFormModal } from '@features/backoffice/logistic/components/ShipmentFormModal';
import { useCreateShipment, useMarkAsShipped, useShipmentsByOrder } from '@features/backoffice/logistic/hooks/useShipments';

const { Text, Title } = Typography;

type OrderFlowStepId = 'PENDING' | 'PAGO' | 'COMPROBANTE' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

interface OrderStatusTimelineProps {
  order: OrderResponse;
  onStatusChange: () => void;
}

const statusSteps: Array<{
  id: OrderFlowStepId;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}> = [
  {
    id: 'PENDING',
    title: 'Pendiente',
    description: 'Pedido creado',
    icon: <IconClock size={24} />,
    color: '#faad14',
  },
  {
    id: 'PAGO',
    title: 'Pago',
    description: 'Pago registrado',
    icon: <IconCash size={24} />,
    color: '#52c41a',
  },
  {
    id: 'COMPROBANTE',
    title: 'Comprobante',
    description: 'Comprobante emitido',
    icon: <IconCreditCard size={24} />,
    color: '#1890ff',
  },
  {
    id: 'PROCESSING',
    title: 'En Proceso',
    description: 'Preparando pedido',
    icon: <IconPackage size={24} />,
    color: '#1890ff',
  },
  {
    id: 'SHIPPED',
    title: 'Enviado',
    description: 'En camino',
    icon: <IconTruck size={24} />,
    color: '#722ed1',
  },
  {
    id: 'DELIVERED',
    title: 'Entregado',
    description: 'Pedido completado',
    icon: <IconCircleCheck size={24} />,
    color: '#52c41a',
  },
];

const specialStatuses: Record<string, { title: string; color: string; icon: ReactNode }> = {
  CANCELLED: {
    title: 'Cancelado',
    color: '#ff4d4f',
    icon: <IconX size={24} />,
  },
  REFUNDED: {
    title: 'Reembolsado',
    color: '#fa8c16',
    icon: <IconRefresh size={24} />,
  },
};

export const OrderStatusTimeline = ({ order, onStatusChange }: OrderStatusTimelineProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);

  const createShipmentMutation = useCreateShipment();
  const markAsShippedMutation = useMarkAsShipped();
  const { data: shipmentsByOrderData } = useShipmentsByOrder(order.id, 0, 50);

  const invoicedCheckOrderIds = order.status === 'PAID' ? [order.id] : [];
  const { data: invoicedOrderIds } = useInvoicedOrderIds(invoicedCheckOrderIds);
  const invoiceExists = invoicedOrderIds?.includes(order.id) ?? false;

  const advanceStatusMutation = useAdvanceOrderStatus(() => {
    onStatusChange();
  });

  const latestOutboundPendingShipmentId = useMemo(() => {
    const shipments = (shipmentsByOrderData?.content || []) as Shipment[];
    const candidates = shipments
      .filter((s) => s.shipmentType === 'OUTBOUND' && s.status === 'PENDING')
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });

    return candidates[0]?.id ?? null;
  }, [shipmentsByOrderData]);

  const currentStepId: OrderFlowStepId = useMemo(() => {
    if (order.status === 'PENDING' || order.status === 'AWAIT_PAYMENT') return 'PENDING';
    if (order.status === 'PAID') return invoiceExists ? 'COMPROBANTE' : 'PAGO';
    if (order.status === 'PROCESSING') return 'PROCESSING';
    if (order.status === 'SHIPPED') return 'SHIPPED';
    return 'DELIVERED';
  }, [order.status, invoiceExists]);

  const currentStepIndex = statusSteps.findIndex((step) => step.id === currentStepId);
  const isSpecialStatus = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  const canAdvance = currentStepIndex < statusSteps.length - 1 && !isSpecialStatus;

  const handleAdvanceStatus = () => {
    if (currentStepId === 'PENDING') {
      setIsPaymentModalOpen(true);
      return;
    }

    if (currentStepId === 'PAGO') {
      setIsInvoiceModalOpen(true);
      return;
    }

    if (currentStepId === 'COMPROBANTE') {
      setIsShipmentModalOpen(true);
      return;
    }

    if (currentStepId === 'PROCESSING') {
      Modal.confirm({
        title: 'Marcar como enviado',
        content: 'Esto marcará el envío como enviado y actualizará el pedido a "Enviado".',
        okText: 'Confirmar',
        cancelText: 'Cancelar',
        okButtonProps: { loading: markAsShippedMutation.isPending },
        onOk: async () => {
          if (!latestOutboundPendingShipmentId) {
            message.error('No hay un envío saliente pendiente para marcar como enviado');
            return;
          }
          await markAsShippedMutation.mutateAsync(latestOutboundPendingShipmentId);
          onStatusChange();
        },
      });
      return;
    }

    if (currentStepId === 'SHIPPED') {
      Modal.confirm({
        title: 'Marcar como entregado',
        content: 'Esto marcará el pedido como entregado.',
        okText: 'Confirmar',
        cancelText: 'Cancelar',
        okButtonProps: { loading: advanceStatusMutation.isPending },
        onOk: async () => {
          await advanceStatusMutation.mutateAsync({ id: order.id, notes: 'Entregado' });
        },
      });
    }
  };

  const special = isSpecialStatus ? specialStatuses[order.status] : null;

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Estado del Pedido
          </Title>
          {special && (
            <Tag icon={special.icon} color={special.color}>
              {special.title}
            </Tag>
          )}
        </Space>
      }
      extra={
        canAdvance && (
          <Button type="primary" icon={<IconChevronRight size={16} />} onClick={handleAdvanceStatus}>
            Avanzar Estado
          </Button>
        )
      }
    >
      {special ? (
        <Card
          style={{
            background: `linear-gradient(135deg, ${special.color}15 0%, ${special.color}05 100%)`,
            border: `2px solid ${special.color}`,
            textAlign: 'center',
            padding: '40px 20px',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ fontSize: 64, color: special.color }}>{special.icon}</div>
            <Title level={2} style={{ margin: 0, color: special.color }}>
              {special.title}
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Este pedido ha sido {order.status === 'CANCELLED' ? 'cancelado' : 'reembolsado'}
            </Text>
          </Space>
        </Card>
      ) : (
        <div style={{ padding: '30px 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 30,
                left: '8%',
                right: '8%',
                height: 4,
                background: '#e8e8e8',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)',
                  width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background:
                        isCompleted || isCurrent
                          ? `linear-gradient(135deg, ${step.color} 0%, ${step.color}cc 100%)`
                          : '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      zIndex: 2,
                      transition: 'all 0.3s ease',
                      color: isCompleted || isCurrent ? '#fff' : '#bfbfbf',
                      boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : 'none',
                      transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {step.icon}
                  </div>

                  <div style={{ textAlign: 'center', maxWidth: 100 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: isCompleted || isCurrent ? '#000' : '#999',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {step.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, lineHeight: '1.3' }}>
                      {step.description}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PaymentFormModal
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onCreated={() => {
          setIsPaymentModalOpen(false);
          onStatusChange();
        }}
        initialOrder={{
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
        }}
        lockOrder
      />

      <InvoiceFormModal
        open={isInvoiceModalOpen}
        onCancel={() => setIsInvoiceModalOpen(false)}
        onCreated={() => {
          setIsInvoiceModalOpen(false);
          onStatusChange();
        }}
        initialOrder={{ id: order.id, orderNumber: order.orderNumber, customerName: order.customerName }}
        lockOrder
      />

      <ShipmentFormModal
        open={isShipmentModalOpen}
        onCancel={() => setIsShipmentModalOpen(false)}
        onSubmit={async (values: CreateShipmentRequest) => {
          await createShipmentMutation.mutateAsync(values);
          setIsShipmentModalOpen(false);
          onStatusChange();
        }}
        isLoading={createShipmentMutation.isPending}
        initialOrder={{
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
        }}
        lockOrder
      />
    </Card>
  );
};
