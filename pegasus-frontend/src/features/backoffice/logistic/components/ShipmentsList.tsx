import { useState } from 'react';
import { Input, Button, Table, Space, Tag, Popconfirm, Select } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useShipments } from '../hooks/useShipments';
import { formatCurrency } from '@shared/utils/formatters';
import { SHIPMENT_STATUSES, SHIPMENT_TYPES } from '../constants';
import dayjs from 'dayjs';
import type { Shipment } from '@types';
import type { ColumnType } from 'antd/es/table';

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

  const { data, isLoading } = useShipments(
    page,
    pageSize,
    debouncedSearch || undefined,
    statusFilter,
    typeFilter
  );

  const handleDelete = (id: number) => {
    onDelete(id);
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
      width: 100,
      render: (type: string) => <Tag>{SHIPMENT_TYPES[type as keyof typeof SHIPMENT_TYPES] || type}</Tag>,
    },
    {
      title: 'Método de Envío',
      dataIndex: 'shippingMethodName',
      key: 'shippingMethodName',
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
      width: 120,
      render: (record: Shipment) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => onView(record.id)}
            title="Ver detalles"
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => onEdit(record.id)}
            title="Editar"
          />
          <Popconfirm
            title="¿Está seguro de eliminar este envío?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<IconTrash size={16} />}
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
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
