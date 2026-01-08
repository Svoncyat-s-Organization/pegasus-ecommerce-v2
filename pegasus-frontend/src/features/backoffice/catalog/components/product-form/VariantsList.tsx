import { useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal, Empty, Space, Image, message, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPower,
  IconDotsVertical,
  IconPhoto,
} from '@tabler/icons-react';
import {
  useVariantsByProduct,
  useDeleteVariant,
  useToggleVariantStatus,
} from '../../hooks/useVariants';
import {
  useImagesByVariant,
  useCreateImage,
  useDeleteImage,
  useUpdateImage,
} from '../../hooks/useImages';
import type { VariantResponse } from '@types';
import { VariantFormModal } from '../VariantFormModal';
import { ImageUploader } from '@shared/components/ImageUploader';
import { formatCurrency } from '@shared/utils/formatters';

interface VariantsListProps {
  productId: number;
}

/**
 * Lista de variantes del producto con gestión de imágenes por variante
 */
export const VariantsList = ({ productId }: VariantsListProps) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantResponse | undefined>();
  const [imagesModalVariant, setImagesModalVariant] = useState<VariantResponse | undefined>();

  const { data: variants, isLoading } = useVariantsByProduct(productId);
  const deleteMutation = useDeleteVariant();
  const toggleStatusMutation = useToggleVariantStatus();

  const handleOpenFormModal = (variant?: VariantResponse) => {
    setEditingVariant(variant);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVariant(undefined);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Eliminar esta variante?',
      content: 'La variante será desactivada.',
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
      onClick: () => handleOpenFormModal(record),
    },
    {
      key: 'images',
      label: 'Imágenes',
      icon: <IconPhoto size={16} />,
      onClick: () => setImagesModalVariant(record),
    },
    { type: 'divider' },
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
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (sku: string) => <code style={{ fontSize: 13 }}>{sku}</code>,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Atributos',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: Record<string, unknown>) => {
        if (!attributes || Object.keys(attributes).length === 0) {
          return <Tag color="default">Sin atributos</Tag>;
        }
        return (
          <Space size={[4, 4]} wrap>
            {Object.entries(attributes).map(([key, value]) => (
              <Tag key={key} color="blue">
                <span style={{ fontWeight: 500 }}>{key}:</span> {String(value)}
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
      width: 90,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right' as const,
      width: 60,
      align: 'center' as const,
      render: (_: unknown, record: VariantResponse) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<IconDotsVertical size={18} />} />
        </Dropdown>
      ),
    },
  ];

  if (!variants || variants.length === 0) {
    return (
      <>
        <Empty description="No hay variantes creadas" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenFormModal()}>
            Crear primera variante
          </Button>
        </Empty>

        <VariantFormModal
          open={isFormModalOpen}
          onCancel={handleCloseFormModal}
          productId={productId}
          variant={editingVariant}
        />
      </>
    );
  }

  return (
    <>
      {/* Botón agregar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenFormModal()}>
          Nueva Variante
        </Button>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        dataSource={variants}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="middle"
        scroll={{ x: 600 }}
      />

      {/* Modal de formulario */}
      <VariantFormModal
        open={isFormModalOpen}
        onCancel={handleCloseFormModal}
        productId={productId}
        variant={editingVariant}
      />

      {/* Modal de imágenes */}
      {imagesModalVariant && (
        <VariantImagesModal
          variant={imagesModalVariant}
          productId={productId}
          onClose={() => setImagesModalVariant(undefined)}
        />
      )}
    </>
  );
};

// Modal para gestionar imágenes de una variante específica
interface VariantImagesModalProps {
  variant: VariantResponse;
  productId: number;
  onClose: () => void;
}

const VariantImagesModal = ({ variant, productId, onClose }: VariantImagesModalProps) => {
  const { token } = theme.useToken();
  const { data: images, isLoading } = useImagesByVariant(variant.id);
  const createMutation = useCreateImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();

  const handleImageUploaded = async (url: string | undefined) => {
    if (!url) return;

    try {
      await createMutation.mutateAsync({
        imageUrl: url,
        productId,
        variantId: variant.id,
        isPrimary: !images || images.length === 0,
        displayOrder: images?.length || 0,
      });
      message.success('Imagen agregada');
    } catch {
      // Error manejado por hook
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await updateMutation.mutateAsync({
        id: imageId,
        request: { isPrimary: true },
      });
      message.success('Imagen principal actualizada');
    } catch {
      // Error manejado por hook
    }
  };

  // Construir descripción de atributos
  const attributesText = variant.attributes
    ? Object.entries(variant.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ')
    : '';

  return (
    <Modal
      title={
        <div>
          <div>Imágenes de Variante</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: token.colorTextSecondary }}>
            {variant.sku} {attributesText && `· ${attributesText}`}
          </div>
        </div>
      }
      open
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {/* Uploader */}
      <div style={{ marginBottom: 16 }}>
        <ImageUploader onChange={handleImageUploaded} folder="products" showPreview={false} />
      </div>

      {/* Grid de imágenes */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>Cargando...</div>
      ) : !images || images.length === 0 ? (
        <Empty description="Sin imágenes para esta variante" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 8,
          }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                border: image.isPrimary ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <Image
                src={image.imageUrl}
                alt=""
                style={{ width: '100%', height: 100, objectFit: 'cover' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  background: token.colorBgLayout,
                }}
              >
                <Button
                  type="text"
                  size="small"
                  disabled={image.isPrimary}
                  onClick={() => handleSetPrimary(image.id)}
                  style={{ fontSize: 11, padding: '0 4px' }}
                >
                  {image.isPrimary ? '★ Principal' : 'Hacer principal'}
                </Button>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<IconTrash size={14} />}
                  onClick={() => handleDelete(image.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
