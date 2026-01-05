import { Table, Button, Tag, Space, Popconfirm } from 'antd';
import { IconEdit, IconPower, IconTrash, IconEye } from '@tabler/icons-react';
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
      width: 150,
      render: (_: unknown, record: WarehouseResponse) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => onView(record)}
            title="Ver detalles"
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => onEdit(record)}
            title="Editar"
          />
          <Button
            type="link"
            size="small"
            icon={<IconPower size={16} />}
            onClick={() => onToggleStatus(record.id)}
            title={record.isActive ? 'Desactivar' : 'Activar'}
          />
          <Popconfirm
            title="¿Eliminar almacén?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => onDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
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
