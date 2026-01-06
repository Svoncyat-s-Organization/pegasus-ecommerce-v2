import { Card, Button, Space, Typography, Tag, Modal, Input, message } from 'antd';
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
import { useState } from 'react';
import type { OrderStatus } from '@types';
import type { ReactNode } from 'react';
import { useAdvanceOrderStatus } from '../hooks/useAdvanceOrderStatus';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  orderId: number;
  onStatusChange: () => void;
}

// Configuración de pasos con íconos y colores
const statusSteps = [
  {
    status: 'PENDING' as OrderStatus,
    title: 'Pendiente',
    description: 'Pedido creado',
    icon: <IconClock size={24} />,
    color: '#faad14',
  },
  {
    status: 'AWAIT_PAYMENT' as OrderStatus,
    title: 'Esperando Pago',
    description: 'Aguardando confirmación',
    icon: <IconCreditCard size={24} />,
    color: '#1890ff',
  },
  {
    status: 'PAID' as OrderStatus,
    title: 'Pagado',
    description: 'Pago confirmado',
    icon: <IconCash size={24} />,
    color: '#52c41a',
  },
  {
    status: 'PROCESSING' as OrderStatus,
    title: 'En Proceso',
    description: 'Preparando pedido',
    icon: <IconPackage size={24} />,
    color: '#1890ff',
  },
  {
    status: 'SHIPPED' as OrderStatus,
    title: 'Enviado',
    description: 'En camino',
    icon: <IconTruck size={24} />,
    color: '#722ed1',
  },
  {
    status: 'DELIVERED' as OrderStatus,
    title: 'Entregado',
    description: 'Pedido completado',
    icon: <IconCircleCheck size={24} />,
    color: '#52c41a',
  },
];

// Estados especiales (cancelado, reembolsado)
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

export const OrderStatusTimeline = ({
  currentStatus,
  orderId,
  onStatusChange,
}: OrderStatusTimelineProps) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  const advanceStatusMutation = useAdvanceOrderStatus(() => {
    setShowNotesModal(false);
    setNotes('');
    onStatusChange();
  });

  // Determinar paso actual
  const currentStepIndex = statusSteps.findIndex((step) => step.status === currentStatus);
  const isSpecialStatus = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';

  const handleAdvanceStatus = () => {
    if (!notes.trim()) {
      message.warning('Por favor ingrese una nota para este cambio');
      return;
    }

    advanceStatusMutation.mutate({ id: orderId, notes });
  };

  const canAdvance = currentStepIndex < statusSteps.length - 1 && !isSpecialStatus;

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Estado del Pedido
          </Title>
          {isSpecialStatus && (
            <Tag icon={specialStatuses[currentStatus].icon} color={specialStatuses[currentStatus].color}>
              {specialStatuses[currentStatus].title}
            </Tag>
          )}
        </Space>
      }
      extra={
        canAdvance && (
          <Button
            type="primary"
            icon={<IconChevronRight size={16} />}
            onClick={() => setShowNotesModal(true)}
          >
            Avanzar Estado
          </Button>
        )
      }
    >
      {isSpecialStatus ? (
        <Card
          style={{
            background: `linear-gradient(135deg, ${specialStatuses[currentStatus].color}15 0%, ${specialStatuses[currentStatus].color}05 100%)`,
            border: `2px solid ${specialStatuses[currentStatus].color}`,
            textAlign: 'center',
            padding: '40px 20px',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ fontSize: 64, color: specialStatuses[currentStatus].color }}>
              {specialStatuses[currentStatus].icon}
            </div>
            <Title level={2} style={{ margin: 0, color: specialStatuses[currentStatus].color }}>
              {specialStatuses[currentStatus].title}
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Este pedido ha sido {currentStatus === 'CANCELLED' ? 'cancelado' : 'reembolsado'}
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
            {/* Línea de conexión */}
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

            {/* Pasos */}
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.status}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  {/* Ícono arriba */}
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

                  {/* Texto abajo */}
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

      <Modal
        title="Avanzar Estado del Pedido"
        open={showNotesModal}
        onCancel={() => {
          setShowNotesModal(false);
          setNotes('');
        }}
        onOk={handleAdvanceStatus}
        confirmLoading={advanceStatusMutation.isPending}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text>
              El pedido pasará de{' '}
              <Tag color={statusSteps[currentStepIndex]?.color}>
                {statusSteps[currentStepIndex]?.title}
              </Tag>{' '}
              a{' '}
              <Tag color={statusSteps[currentStepIndex + 1]?.color}>
                {statusSteps[currentStepIndex + 1]?.title}
              </Tag>
            </Text>
          </div>
          <div>
            <Text strong>Notas (requerido):</Text>
            <TextArea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ingrese una nota explicando el cambio de estado..."
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>
    </Card>
  );
};
