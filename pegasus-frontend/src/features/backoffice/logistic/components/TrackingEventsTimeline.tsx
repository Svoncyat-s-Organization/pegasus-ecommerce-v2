import { Timeline, Typography, Tag, Empty, Spin, Button, Space } from 'antd';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTrackingEvents } from '../hooks/useTrackingEvents';
import { TrackingEventFormModal } from './TrackingEventFormModal';
import { TRACKING_EVENT_STATUSES } from '../constants';
import { formatDate } from '@shared/utils/formatters';
import type { TrackingEvent } from '@types';

const { Text } = Typography;

interface TrackingEventsTimelineProps {
  shipmentId: number;
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    CREATED: 'blue',
    IN_TRANSIT: 'cyan',
    OUT_FOR_DELIVERY: 'orange',
    DELIVERED: 'green',
    EXCEPTION: 'red',
    RETURNED: 'purple',
  };
  return colorMap[status] || 'default';
};

export const TrackingEventsTimeline = ({ shipmentId }: TrackingEventsTimelineProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: events, isLoading } = useTrackingEvents(shipmentId);

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!events || events.length === 0) {
    return (
      <div>
        <Empty
          description="No hay eventos de tracking registrados"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Agregar Evento
          </Button>
        </div>
        <TrackingEventFormModal
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          shipmentId={shipmentId}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          size="small"
          icon={<IconPlus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Agregar Evento
        </Button>
      </div>

      <Timeline mode="left">
        {events.map((event: TrackingEvent) => (
          <Timeline.Item
            key={event.id}
            color={getStatusColor(event.status)}
            label={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(event.eventDate)}
              </Text>
            }
          >
            <Space direction="vertical" size="small">
              <Tag color={getStatusColor(event.status)}>
                {TRACKING_EVENT_STATUSES[event.status as keyof typeof TRACKING_EVENT_STATUSES] || event.status}
              </Tag>
              <Text strong>{event.description}</Text>
              {event.location && <Text type="secondary">Ubicación: {event.location}</Text>}
              <Text type="secondary" style={{ fontSize: 11 }}>
                Por: {event.createdByUsername}
              </Text>
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>

      <TrackingEventFormModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        shipmentId={shipmentId}
      />
    </div>
  );
};
