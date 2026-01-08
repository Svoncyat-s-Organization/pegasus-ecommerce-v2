import { Card, Space, Typography, Tag } from 'antd';
import {
    IconClock,
    IconCircleCheck,
    IconTruck,
    IconPackage,
    IconSearch,
    IconRefresh,
    IconX,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { RmaStatus } from '@types';

const { Text, Title } = Typography;

interface RmaStatusTimelineProps {
    currentStatus: RmaStatus;
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

/**
 * Componente de timeline de estado de RMA para storefront
 * Solo visualización - sin botones de acción
 */
export const RmaStatusTimeline = ({ currentStatus }: RmaStatusTimelineProps) => {
    const currentStepIndex = statusSteps.findIndex((step) => step.status === currentStatus);
    const isSpecialStatus = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

    const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

    return (
        <Card
            title={
                <Space>
                    <Title level={5} style={{ margin: 0 }}>
                        Estado de la Devolución
                    </Title>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {isSpecialStatus && specialStatuses[currentStatus] ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '24px 0',
                    }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            color: specialStatuses[currentStatus]!.color,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {specialStatuses[currentStatus]!.icon}
                    </div>
                    <div>
                        <Tag color={specialStatuses[currentStatus]!.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                            {specialStatuses[currentStatus]!.title}
                        </Tag>
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            {currentStatus === 'CANCELLED'
                                ? 'La solicitud de devolución ha sido cancelada'
                                : 'La solicitud de devolución ha sido rechazada'}
                        </Text>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        padding: '24px 0',
                    }}
                >
                    {/* Línea de progreso */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: 2,
                            backgroundColor: '#d9d9d9',
                            transform: 'translateY(-50%)',
                            zIndex: 0,
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                backgroundColor: '#1890ff',
                                width: `${(safeStepIndex / (statusSteps.length - 1)) * 100}%`,
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>

                    {/* Pasos */}
                    {statusSteps.map((step, index) => {
                        const isActive = index === safeStepIndex;
                        const isCompleted = index < safeStepIndex;
                        const isPending = index > safeStepIndex;

                        return (
                            <div
                                key={step.status}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    flex: 1,
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted
                                            ? '#52c41a'
                                            : isActive
                                                ? step.color
                                                : '#d9d9d9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        marginBottom: 12,
                                        border: isActive ? '3px solid white' : 'none',
                                        boxShadow: isActive ? `0 0 0 3px ${step.color}` : 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {step.icon}
                                </div>
                                <Text
                                    strong={isActive}
                                    style={{
                                        fontSize: isActive ? 14 : 12,
                                        color: isActive
                                            ? step.color
                                            : isCompleted
                                                ? '#52c41a'
                                                : isPending
                                                    ? '#8c8c8c'
                                                    : 'inherit',
                                        textAlign: 'center',
                                        marginBottom: 4,
                                    }}
                                >
                                    {step.title}
                                </Text>
                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 11,
                                        textAlign: 'center',
                                        color: isPending ? '#bfbfbf' : undefined,
                                    }}
                                >
                                    {step.description}
                                </Text>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};
