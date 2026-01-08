import { useState } from 'react';
import { Card, Input, Button, Table, Tag, Typography, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconPlus, IconEdit, IconTrash, IconPower, IconSearch, IconDotsVertical } from '@tabler/icons-react';
import { useBrands, useDeleteBrand, useToggleBrandStatus, useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import { useDebounce } from '@shared/hooks/useDebounce';
import { BrandFormModal } from '../components/BrandFormModal';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from '@types';

const { Title, Text } = Typography;

export const BrandsListPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | undefined>();

  const { data, isLoading } = useBrands(page, pageSize, debouncedSearch || undefined);
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();
  const toggleStatusMutation = useToggleBrandStatus();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handleOpenModal = (brand?: BrandResponse) => {
    setEditingBrand(brand);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBrand(undefined);
  };

  const handleSubmit = (values: CreateBrandRequest | UpdateBrandRequest) => {
    if (editingBrand) {
      updateMutation.mutate(
        { id: editingBrand.id, request: values as UpdateBrandRequest },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    } else {
      createMutation.mutate(values as CreateBrandRequest, {
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
      render: (_: unknown, __: BrandResponse, index: number) => page * pageSize + index + 1,
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
      render: (_: unknown, record: BrandResponse) => {
        const items: MenuProps['items'] = [
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
                title: '¿Eliminar marca permanentemente?',
                content: 'Esta acción es irreversible. Solo se puede eliminar si no tiene productos asociados.',
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
          Marcas
        </Title>
        <Text type="secondary">
          Gestión de marcas del catálogo. Crea, edita y administra marcas de productos.
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
          prefix={<IconSearch size={16} />}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Nueva Marca
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
          showTotal: (total) => `Total: ${total} marcas`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <BrandFormModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editingBrand}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </Card>
  );
};
