import { Card, Button, Space, Typography, Tag } from 'antd';
import {
  IconClock,
  IconCircleCheck,
  IconTruck,
  IconPackage,
  IconSearch,
  IconRefresh,
  IconX,
  IconChevronRight,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { RmaStatus } from '@types';

const { Text, Title } = Typography;

interface RmaStatusTimelineProps {
  currentStatus: RmaStatus;
  canAdvance: boolean;
  onAdvance: () => void;
}

const statusSteps: Array<{
  status: RmaStatus;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}> = [
  {
    status: 'PENDING',
    title: 'Pendiente',
    description: 'Solicitud creada',
    icon: <IconClock size={24} />,
    color: '#faad14',
  },
  {
    status: 'APPROVED',
    title: 'Aprobado',
    description: 'Solicitud aprobada',
    icon: <IconCircleCheck size={24} />,
    color: '#1890ff',
  },
  {
    status: 'IN_TRANSIT',
    title: 'En Tránsito',
    description: 'Cliente envió el paquete',
    icon: <IconTruck size={24} />,
    color: '#52c41a',
  },
  {
    status: 'RECEIVED',
    title: 'Recibido',
    description: 'Paquete recibido',
    icon: <IconPackage size={24} />,
    color: '#1890ff',
  },
  {
    status: 'INSPECTING',
    title: 'En Inspección',
    description: 'Revisando productos',
    icon: <IconSearch size={24} />,
    color: '#722ed1',
  },
  {
    status: 'REFUNDED',
    title: 'Reembolso/Cambio',
    description: 'Procesando resolución',
    icon: <IconRefresh size={24} />,
    color: '#fa8c16',
  },
  {
    status: 'CLOSED',
    title: 'Cerrado',
    description: 'Proceso completado',
    icon: <IconCircleCheck size={24} />,
    color: '#52c41a',
  },
];

const specialStatuses: Partial<Record<RmaStatus, { title: string; color: string; icon: ReactNode }>> = {
  CANCELLED: {
    title: 'Cancelado',
    color: '#ff4d4f',
    icon: <IconX size={24} />,
  },
  REJECTED: {
    title: 'Rechazado',
    color: '#ff4d4f',
    icon: <IconX size={24} />,
  },
};

export const RmaStatusTimeline = ({ currentStatus, canAdvance, onAdvance }: RmaStatusTimelineProps) => {
  const currentStepIndex = statusSteps.findIndex((step) => step.status === currentStatus);
  const isSpecialStatus = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Estado de la Devolución
          </Title>
          {isSpecialStatus && specialStatuses[currentStatus] && (
            <Tag icon={specialStatuses[currentStatus]?.icon} color={specialStatuses[currentStatus]?.color}>
              {specialStatuses[currentStatus]?.title}
            </Tag>
          )}
        </Space>
      }
      extra={
        canAdvance && (
          <Button type="primary" icon={<IconChevronRight size={16} />} onClick={onAdvance}>
            Avanzar estado
          </Button>
        )
      }
    >
      {isSpecialStatus && specialStatuses[currentStatus] ? (
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
              Esta devolución ha sido {currentStatus === 'CANCELLED' ? 'cancelada' : 'rechazada'}
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
                  width: `${(safeStepIndex / (statusSteps.length - 1)) * 100}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            {/* Pasos */}
            {statusSteps.map((step, index) => {
              const isCompleted = index < safeStepIndex;
              const isCurrent = index === safeStepIndex;

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

                  <div style={{ textAlign: 'center', maxWidth: 110 }}>
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
    </Card>
  );
};
