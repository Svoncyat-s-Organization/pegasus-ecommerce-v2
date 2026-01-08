import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Table, Tag, Typography, Modal, Descriptions, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconEye, IconPower, IconDotsVertical } from '@tabler/icons-react';
import { useProducts, useDeleteProduct, useToggleProductStatus } from '../hooks/useProducts';
import { useDebounce } from '@shared/hooks/useDebounce';
import type { ProductResponse } from '@types';

const { Title, Text } = Typography;

export const ProductsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | undefined>();

  const { data, isLoading } = useProducts(page, pageSize, debouncedSearch || undefined);
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Eliminar producto?',
      content: 'Esta acción desactivará el producto. Podrás reactivarlo después si lo necesitas.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const getActionItems = (record: ProductResponse): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Ver detalles',
      icon: <IconEye size={16} />,
      onClick: () => handleOpenDetail(record),
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <IconEdit size={16} />,
      onClick: () => handleEdit(record.id),
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

  const handleCreate = () => {
    navigate('/admin/catalog/products/new');
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/catalog/products/${id}/edit`);
  };

  const handleOpenDetail = (product: ProductResponse) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedProduct(undefined);
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: ProductResponse, index: number) => page * pageSize + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Marca',
      dataIndex: 'brandName',
      key: 'brandName',
      render: (brandName: string) => brandName || '-',
    },
    {
      title: 'Categoría',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName: string) => categoryName || '-',
    },
    {
      title: 'Destacado',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 100,
      render: (isFeatured: boolean) => (
        <Tag color={isFeatured ? 'blue' : 'default'}>
          {isFeatured ? 'Sí' : 'No'}
        </Tag>
      ),
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
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: ProductResponse) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<IconDotsVertical size={18} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Productos
        </Title>
        <Text type="secondary">
          Gestión de productos del catálogo. Crea, edita y administra productos con variantes.
        </Text>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Input
          placeholder="Buscar por nombre, SKU o descripción..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={16} />} onClick={handleCreate}>
          Nuevo Producto
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
          showTotal: (total) => `Total: ${total} productos`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <Modal
        title="Detalle del Producto"
        open={detailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={700}
      >
        {selectedProduct && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedProduct.id}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{selectedProduct.name}</Descriptions.Item>
            <Descriptions.Item label="Slug">{selectedProduct.slug}</Descriptions.Item>
            <Descriptions.Item label="Código">{selectedProduct.code}</Descriptions.Item>
            <Descriptions.Item label="Descripción">
              {selectedProduct.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Marca">{selectedProduct.brandName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Categoría">{selectedProduct.categoryName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Destacado">
              <Tag color={selectedProduct.isFeatured ? 'blue' : 'default'}>
                {selectedProduct.isFeatured ? 'Sí' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={selectedProduct.isActive ? 'success' : 'default'}>
                {selectedProduct.isActive ? 'Activo' : 'Inactivo'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              {new Date(selectedProduct.createdAt).toLocaleString('es-PE')}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              {new Date(selectedProduct.updatedAt).toLocaleString('es-PE')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};
