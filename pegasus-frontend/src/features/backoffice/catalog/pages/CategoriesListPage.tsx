import { useState, useMemo } from 'react';
import { Card, Input, Button, Table, Tag, Typography, Drawer, Dropdown, Modal, Space } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconPower, IconSearch, IconFolder, IconFile, IconSettings, IconDotsVertical } from '@tabler/icons-react';
import { useDeleteCategory, useToggleCategoryStatus, useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import { useDebounce } from '@shared/hooks/useDebounce';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { CategorySpecificationsEditor } from '../components/CategorySpecificationsEditor';
import { getCategoriesTree } from '../api/categoriesApi';
import { useQuery } from '@tanstack/react-query';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@types';

const { Title, Text } = Typography;

export const CategoriesListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();
  const [specsDrawerOpen, setSpecsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  // Usar árbol jerárquico en lugar de paginación
  const { data: treeData, isLoading } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: getCategoriesTree,
  });
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

  const handleOpenSpecsDrawer = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setSpecsDrawerOpen(true);
  };

  const handleCloseSpecsDrawer = () => {
    setSpecsDrawerOpen(false);
    setSelectedCategory(null);
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

  // Filtrar árbol de categorías basado en búsqueda
  const filteredData = useMemo(() => {
    if (!treeData) return [];
    if (!debouncedSearch) return treeData;

    const searchLower = debouncedSearch.toLowerCase();
    
    const filterTree = (categories: CategoryResponse[]): CategoryResponse[] => {
      return categories.reduce<CategoryResponse[]>((acc, category) => {
        const matchesSearch = 
          category.name.toLowerCase().includes(searchLower) ||
          category.slug.toLowerCase().includes(searchLower);
        
        const filteredChildren = category.children ? filterTree(category.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...category,
            children: filteredChildren.length > 0 ? filteredChildren : category.children,
          });
        }
        
        return acc;
      }, []);
    };

    return filterTree(treeData);
  }, [treeData, debouncedSearch]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, record: CategoryResponse) => (
        <Space size="small">
          {record.children && record.children.length > 0 ? (
            <IconFolder size={20} style={{ color: '#2f54eb' }} />
          ) : (
            <IconFile size={20} style={{ color: '#8c8c8c' }} />
          )}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
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
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: CategoryResponse) => {
        const items: MenuProps['items'] = [
          {
            key: 'specs',
            label: 'Especificaciones',
            icon: <IconSettings size={16} />,
            onClick: () => handleOpenSpecsDrawer(record),
          },
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
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar categoría permanentemente?',
                content: 'Esta acción es irreversible. Solo se puede eliminar si no tiene productos ni subcategorías.',
                okText: 'Sí, eliminar',
                cancelText: 'Cancelar',
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
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          prefix={<IconSearch size={16} />}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Nueva Categoría
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={false}
        expandable={{
          defaultExpandAllRows: false,
          childrenColumnName: 'children',
          indentSize: 24,
        }}
      />

      <CategoryFormModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Drawer
        title={`Especificaciones: ${selectedCategory?.name || ''}`}
        placement="right"
        width={700}
        onClose={handleCloseSpecsDrawer}
        open={specsDrawerOpen}
        destroyOnClose
      >
        {selectedCategory && (
          <CategorySpecificationsEditor
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
            onClose={handleCloseSpecsDrawer}
          />
        )}
      </Drawer>
    </Card>
  );
};
