import { useState } from 'react';
import { Table, Button, Space, Tag, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconPower, IconDotsVertical } from '@tabler/icons-react';
import { useVariantsByProduct, useDeleteVariant, useToggleVariantStatus } from '../hooks/useVariants';
import type { VariantResponse } from '@types';
import { VariantFormModal } from './VariantFormModal';
import { formatCurrency } from '@shared/utils/formatters';

interface VariantsSectionProps {
  productId: number;
}

export const VariantsSection = ({ productId }: VariantsSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantResponse | undefined>();

  const { data: variants, isLoading } = useVariantsByProduct(productId);
  const deleteMutation = useDeleteVariant();
  const toggleStatusMutation = useToggleVariantStatus();

  const handleOpenModal = (variant?: VariantResponse) => {
    setEditingVariant(variant);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVariant(undefined);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Eliminar variante?',
      content: 'Esta acción desactivará la variante.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const getActionItems = (record: VariantResponse): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Editar',
      icon: <IconEdit size={16} />,
      onClick: () => handleOpenModal(record),
    },
    {
      type: 'divider',
    },
    {
      key: 'toggle',
      label: record.isActive ? 'Desactivar' : 'Activar',
      icon: <IconPower size={16} />,
      onClick: () => handleToggleStatus(record.id),
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <IconTrash size={16} />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Atributos',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: Record<string, unknown>) => {
        if (!attributes || Object.keys(attributes).length === 0) {
          return <Tag>Sin atributos</Tag>;
        }
        return (
          <Space size={[0, 4]} wrap>
            {Object.entries(attributes).map(([key, value]) => (
              <Tag key={key}>
                {key}: {String(value)}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: VariantResponse) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<IconDotsVertical size={18} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Nueva Variante
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={variants || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={false}
        locale={{ emptyText: 'No hay variantes registradas' }}
      />

      <VariantFormModal
        open={modalOpen}
        onCancel={handleCloseModal}
        productId={productId}
        variant={editingVariant}
      />
    </div>
  );
};
