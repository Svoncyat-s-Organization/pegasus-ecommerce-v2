import { useState } from 'react';
import { Input, Button, Table, Tag, Select, message, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconEye, IconRefresh, IconTruckDelivery, IconDotsVertical } from '@tabler/icons-react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useShipments, useMarkAsShipped } from '../hooks/useShipments';
import { formatCurrency } from '@shared/utils/formatters';
import { SHIPMENT_STATUSES, SHIPMENT_TYPES } from '../constants';
import dayjs from 'dayjs';
import type { Shipment } from '@types';
import type { ColumnType } from 'antd/es/table';
import { useQueryClient } from '@tanstack/react-query';

const { Option } = Select;

interface ShipmentsListProps {
  onEdit: (id: number) => void;
  onCreate: () => void;
  onView: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
}

export const ShipmentsList = ({ onEdit, onCreate, onView, onDelete }: ShipmentsListProps) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const markAsShippedMutation = useMarkAsShipped();

  const { data, isLoading } = useShipments(
    page,
    pageSize,
    debouncedSearch || undefined,
    statusFilter,
    typeFilter
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
  };

  const handleDelete = (id: number) => {
    onDelete(id);
  };

  const handleMarkAsShipped = async (id: number) => {
    try {
      await markAsShippedMutation.mutateAsync(id);
      message.success('Envío marcado como enviado exitosamente');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al marcar el envío como enviado');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'default',
      IN_TRANSIT: 'processing',
      DELIVERED: 'success',
      CANCELLED: 'error',
      RETURNED: 'warning',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnType<Shipment>[] = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => page * pageSize + index + 1,
    },
    {
      title: 'Nº Tracking',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 160,
    },
    {
      title: 'Tipo',
      dataIndex: 'shipmentType',
      key: 'shipmentType',
      width: 180,
      render: (type: string) => {
        const isOutbound = type === 'OUTBOUND';
        return <Tag color={isOutbound ? 'green' : 'red'}>{isOutbound ? 'Pedido' : 'Devolución'}</Tag>;
      },
    },
    {
      title: 'Método de Envío',
      dataIndex: 'shippingMethodName',
      key: 'shippingMethodName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Destinatario',
      dataIndex: 'recipientName',
      key: 'recipientName',
    },
    {
      title: 'Peso (kg)',
      dataIndex: 'weightKg',
      key: 'weightKg',
      width: 100,
      render: (weight: number) => `${weight} kg`,
    },
    {
      title: 'Costo',
      dataIndex: 'shippingCost',
      key: 'shippingCost',
      width: 120,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {SHIPMENT_STATUSES[status as keyof typeof SHIPMENT_STATUSES] || status}
        </Tag>
      ),
    },
    {
      title: 'Fecha Estimada',
      dataIndex: 'estimatedDeliveryDate',
      key: 'estimatedDeliveryDate',
      width: 130,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center' as const,
      render: (record: Shipment) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalles',
            icon: <IconEye size={16} />,
            onClick: () => onView(record.id),
          },
          ...(record.status === 'PENDING' && record.shipmentType === 'OUTBOUND'
            ? [
                {
                  key: 'ship',
                  label: 'Marcar como enviado',
                  icon: <IconTruckDelivery size={16} />,
                  onClick: () => {
                    Modal.confirm({
                      title: '¿Confirmar envío?',
                      content: 'Esto marcará el envío como en tránsito y actualizará el pedido.',
                      okText: 'Sí',
                      cancelText: 'No',
                      onOk: () => handleMarkAsShipped(record.id),
                    });
                  },
                },
              ]
            : []),
          {
            key: 'edit',
            label: 'Editar',
            icon: <IconEdit size={16} />,
            onClick: () => onEdit(record.id),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar envío?',
                content: 'El pedido volverá a estado PAGADO',
                okText: 'Sí',
                cancelText: 'No',
                okButtonProps: { danger: true },
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<IconDotsVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Buscar por tracking, destinatario o teléfono..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Select
          placeholder="Estado"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
          allowClear
          style={{ width: 150 }}
        >
          {Object.entries(SHIPMENT_STATUSES).map(([key, label]) => (
            <Option key={key} value={key}>
              {label}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Tipo"
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value);
            setPage(0);
          }}
          allowClear
          style={{ width: 150 }}
        >
          {Object.entries(SHIPMENT_TYPES).map(([key, label]) => (
            <Option key={key} value={key}>
              {label}
            </Option>
          ))}
        </Select>
        <Button type="primary" icon={<IconPlus />} onClick={onCreate} style={{ marginLeft: 'auto' }}>
          Nuevo Envío
        </Button>
        <Button icon={<IconRefresh />} onClick={handleRefresh} title="Actualizar lista">
          Actualizar
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        scroll={{ x: 1400 }}
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} envíos`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />
    </>
  );
};
