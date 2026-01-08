import { Table, Button, Tag, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconEdit, IconPower, IconTrash, IconEye, IconDotsVertical } from '@tabler/icons-react';
import type { WarehouseResponse } from '@types';
import dayjs from 'dayjs';

interface WarehouseListProps {
  data: WarehouseResponse[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onView: (warehouse: WarehouseResponse) => void;
  onEdit: (warehouse: WarehouseResponse) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export const WarehouseList = ({
  data,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: WarehouseListProps) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Creado',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: WarehouseResponse) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalles',
            icon: <IconEye size={16} />,
            onClick: () => onView(record),
          },
          {
            key: 'edit',
            label: 'Editar',
            icon: <IconEdit size={16} />,
            onClick: () => onEdit(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Desactivar' : 'Activar',
            icon: <IconPower size={16} />,
            onClick: () => onToggleStatus(record.id),
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar almacén?',
                content: 'Esta acción no se puede deshacer',
                okText: 'Eliminar',
                cancelText: 'Cancelar',
                okButtonProps: { danger: true },
                onOk: () => onDelete(record.id),
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
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} almacenes`,
        onChange: onPageChange,
      }}
    />
  );
};
