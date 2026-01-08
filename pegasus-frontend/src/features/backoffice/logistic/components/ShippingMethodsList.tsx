import { useState } from 'react';
import { Input, Button, Table, Tag, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconEye, IconDotsVertical } from '@tabler/icons-react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useShippingMethods, useDeleteShippingMethod } from '../hooks/useShippingMethods';
import { formatCurrency } from '@shared/utils/formatters';
import type { ShippingMethod } from '@types';
import type { ColumnType } from 'antd/es/table';

interface ShippingMethodsListProps {
  onEdit: (id: number) => void;
  onCreate: () => void;
  onView: (id: number) => void;
}

export const ShippingMethodsList = ({ onEdit, onCreate, onView }: ShippingMethodsListProps) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useShippingMethods(page, pageSize, debouncedSearch || undefined);
  const deleteMutation = useDeleteShippingMethod();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const columns: ColumnType<ShippingMethod>[] = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => page * pageSize + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Transportista',
      dataIndex: 'carrier',
      key: 'carrier',
    },
    {
      title: 'Tiempo Estimado (días)',
      key: 'estimatedDays',
      width: 180,
      render: (record: ShippingMethod) =>
        `${record.estimatedDaysMin} - ${record.estimatedDaysMax} días`,
    },
    {
      title: 'Costo Base',
      dataIndex: 'baseCost',
      key: 'baseCost',
      width: 120,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: 'Costo por Kg',
      dataIndex: 'costPerKg',
      key: 'costPerKg',
      width: 120,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center' as const,
      render: (record: ShippingMethod) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalles',
            icon: <IconEye size={16} />,
            onClick: () => onView(record.id),
          },
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
                title: '¿Eliminar método de envío?',
                content: '¿Está seguro de eliminar este método de envío?',
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
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Input
          placeholder="Buscar por nombre, transportista o descripción..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus />} onClick={onCreate}>
          Nuevo Método de Envío
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} métodos de envío`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />
    </>
  );
};
