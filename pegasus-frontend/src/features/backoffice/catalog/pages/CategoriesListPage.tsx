import { useState } from 'react';
import { Card, Input, Button, Table, Space, Popconfirm, Tag, Typography } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconPower } from '@tabler/icons-react';
import { useCategories, useDeleteCategory, useToggleCategoryStatus, useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import { useDebounce } from '@shared/hooks/useDebounce';
import { CategoryFormModal } from '../components/CategoryFormModal';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@types';

const { Title, Text } = Typography;

export const CategoriesListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();

  const { data, isLoading } = useCategories(page, pageSize, debouncedSearch || undefined);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handleOpenModal = (category?: CategoryResponse) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleSubmit = (values: CreateCategoryRequest | UpdateCategoryRequest) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, request: values as UpdateCategoryRequest },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    } else {
      createMutation.mutate(values as CreateCategoryRequest, {
        onSuccess: () => {
          handleCloseModal();
        },
      });
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: CategoryResponse, index: number) => page * pageSize + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Categoría Padre',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent: CategoryResponse | null) => parent?.name || 'Raíz',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
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
      width: 150,
      render: (_: unknown, record: CategoryResponse) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleOpenModal(record)}
            title="Editar"
          />
          <Button
            type="link"
            size="small"
            danger={record.isActive}
            style={!record.isActive ? { color: '#8c8c8c' } : undefined}
            icon={<IconPower size={16} />}
            onClick={() => handleToggleStatus(record.id)}
            title={record.isActive ? 'Desactivar' : 'Activar'}
          />
          <Popconfirm
            title="¿Eliminar categoría?"
            description="Esta acción no se puede deshacer"
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
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Categorías
        </Title>
        <Text type="secondary">
          Gestión de categorías del catálogo. Crea, edita y administra categorías de productos.
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
          placeholder="Buscar por nombre o slug..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Nueva Categoría
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
          showTotal: (total) => `Total: ${total} categorías`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <CategoryFormModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </Card>
  );
};
