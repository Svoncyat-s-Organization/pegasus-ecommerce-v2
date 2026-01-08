import { useState } from 'react';
import { Table, Button, Tag, Space, Image, message, Typography, Modal, Alert } from 'antd';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPower,
  IconPhoto,
} from '@tabler/icons-react';
import {
  useVariantsByProduct,
  useToggleVariantStatus,
  useHardDeleteVariant,
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
import type { LocalVariantAttribute } from './ProductVariantAttributesEditor';

const { Text } = Typography;

interface LocalVariant {
  sku: string;
  price: number;
  attributes: Record<string, unknown>;
  tempId?: string;
  isActive?: boolean;
}

interface VariantsListProps {
  productId?: number;
  localMode?: boolean;
  localVariantAttributes?: LocalVariantAttribute[];
  onLocalChange?: (variants: LocalVariant[]) => void;
}

/**
 * Gestión de variantes con diseño minimalista y profesional
 */
export const VariantsList = ({ 
  productId, 
  localMode = false,
  localVariantAttributes = [],
  onLocalChange,
}: VariantsListProps) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantResponse | LocalVariant | undefined>();
  const [imagesModalVariant, setImagesModalVariant] = useState<VariantResponse | undefined>();
  const [localVariants, setLocalVariants] = useState<LocalVariant[]>([]);

  const { data: serverVariants, isLoading } = useVariantsByProduct(
    productId || 0,
    { enabled: !localMode && !!productId }
  );
  const toggleStatusMutation = useToggleVariantStatus();
  const hardDeleteMutation = useHardDeleteVariant();

  const variants = localMode ? localVariants : serverVariants;

  const handleOpenFormModal = (variant?: VariantResponse | LocalVariant) => {
    setEditingVariant(variant);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVariant(undefined);
  };

  const handleVariantSaved = (variant: LocalVariant | VariantResponse) => {
    if (localMode && onLocalChange) {
      // Local mode: update local state
      if ('tempId' in variant) {
        // Editing existing local variant
        const updated = localVariants.map((v) =>
          v.tempId === variant.tempId ? variant : v
        );
        setLocalVariants(updated);
        onLocalChange(updated);
      } else {
        // New local variant
        const newVariant: LocalVariant = {
          ...variant,
          tempId: `temp-${Date.now()}`,
          isActive: true,
        };
        const updated = [...localVariants, newVariant];
        setLocalVariants(updated);
        onLocalChange(updated);
      }
    }
    handleCloseFormModal();
  };

  const handleDelete = (idOrTempId: number | string, sku: string, hasOrders?: boolean) => {
    if (localMode && typeof idOrTempId === 'string' && onLocalChange) {
      // Local mode: remove from local state
      Modal.confirm({
        title: '¿Eliminar esta variante?',
        content: `La variante ${sku} será eliminada.`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: () => {
          const updated = localVariants.filter((v) => v.tempId !== idOrTempId);
          setLocalVariants(updated);
          onLocalChange(updated);
          message.success('Variante eliminada');
        },
      });
      return;
    }

    // Server mode: check if variant has orders
    if (typeof idOrTempId === 'number') {
      if (hasOrders) {
        // Variant has orders - cannot delete
        Modal.warning({
          title: 'No se puede eliminar',
          content: `La variante ${sku} tiene pedidos asociados. Solo puede desactivarla usando el botón de encendido/apagado.`,
          okText: 'Entendido',
        });
      } else {
        // No orders - can hard delete
        Modal.confirm({
          title: '¿Eliminar esta variante permanentemente?',
          content: `La variante ${sku} será eliminada de forma definitiva. Esta acción no se puede deshacer.`,
          okText: 'Eliminar',
          okType: 'danger',
          cancelText: 'Cancelar',
          onOk: () => hardDeleteMutation.mutate(idOrTempId),
        });
      }
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Componente para el botón de imágenes con color dinámico
  const ImageButton = ({ variantId, onClick }: { variantId: number; onClick: () => void }) => {
    const { data: images } = useImagesByVariant(variantId);
    const hasImages = images && images.length > 0;

    return (
      <Button
        type="link"
        size="small"
        icon={<IconPhoto size={16} />}
        title="Imágenes"
        onClick={onClick}
        style={{ color: hasImages ? '#1890ff' : '#8c8c8c' }}
      />
    );
  };

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
      width: 160,
      render: (sku: string) => <code style={{ fontSize: 13, fontWeight: 500 }}>{sku}</code>,
    },
    {
      title: 'Atributos',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: Record<string, unknown>) => {
        if (!attributes || Object.keys(attributes).length === 0) {
          return <Text type="secondary">—</Text>;
        }
        return (
          <Space size={[6, 6]} wrap>
            {Object.entries(attributes).map(([key, value]) => (
              <Tag key={key} color="blue" style={{ margin: 0 }}>
                <strong>{key}:</strong> {String(value)}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => <strong>{formatCurrency(price)}</strong>,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'} style={{ margin: 0 }}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: localMode ? 100 : 150,
      align: 'center' as const,
      render: (_: unknown, record: VariantResponse | LocalVariant) => {
        const variantId = 'id' in record ? record.id : record.tempId!;
        const isTempId = typeof variantId === 'string';
        const hasOrders = 'hasOrders' in record ? record.hasOrders : false;
        
        return (
          <Space size="small">
            {!localMode && !isTempId && 'id' in record && (
              <>
                <ImageButton
                  variantId={record.id}
                  onClick={() => setImagesModalVariant(record)}
                />
                <Button
                  type="link"
                  danger={record.isActive}
                  size="small"
                  icon={<IconPower size={16} />}
                  title={record.isActive ? 'Desactivar' : 'Activar'}
                  onClick={() => handleToggleStatus(record.id)}
                  style={{ color: record.isActive ? undefined : '#8c8c8c' }}
                />
              </>
            )}
            <Button
              type="link"
              size="small"
              icon={<IconEdit size={16} />}
              title="Editar"
              onClick={() => handleOpenFormModal(record)}
            />
            <Button
              type="link"
              danger={!hasOrders}
              size="small"
              icon={<IconTrash size={16} />}
              title={hasOrders ? 'No se puede eliminar (tiene pedidos)' : 'Eliminar permanentemente'}
              onClick={() => handleDelete(variantId, record.sku, hasOrders)}
              style={{ color: hasOrders ? '#8c8c8c' : undefined }}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {/* Alert for local mode */}
      {localMode && localVariantAttributes.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="Configura atributos de variante primero"
          description="Para crear variantes, primero debes configurar los atributos de variante en la sección anterior."
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
              Variantes del Producto
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {localMode 
                ? 'Configura las variantes del producto (se guardarán al crear)'
                : 'Gestiona las variantes con sus atributos, precios e imágenes específicas'}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={() => handleOpenFormModal()}
            disabled={localMode && localVariantAttributes.length === 0}
          >
            Nueva Variante
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        dataSource={variants || []}
        rowKey={(record) => ('id' in record ? record.id.toString() : record.tempId!)}
        loading={isLoading}
        pagination={false}
        bordered
        size="middle"
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Text type="secondary">No hay variantes creadas</Text>
              {localVariantAttributes.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<IconPlus size={16} />}
                    onClick={() => handleOpenFormModal()}
                  >
                    Crear Primera Variante
                  </Button>
                </div>
              )}
            </div>
          ),
        }}
      />

      {/* Modal de formulario */}
      <VariantFormModal
        open={isFormModalOpen}
        onCancel={handleCloseFormModal}
        productId={productId}
        variant={editingVariant}
        localMode={localMode}
        localVariantAttributes={localVariantAttributes}
        onLocalSave={handleVariantSaved}
      />

      {/* Modal de imágenes */}
      {imagesModalVariant && !localMode && (
        <VariantImagesModal
          variant={imagesModalVariant}
          productId={productId!}
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
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Imágenes de Variante
          </div>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
            {variant.sku} {attributesText && `· ${attributesText}`}
          </Text>
        </div>
      }
      open
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {/* Uploader */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          Cargar Imagen
        </Text>
        <ImageUploader onChange={handleImageUploaded} folder="products" showPreview={false} />
      </div>

      {/* Grid de imágenes */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          Imágenes ({images?.length || 0})
        </Text>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Cargando imágenes...
          </div>
        ) : !images || images.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              background: '#fafafa',
              borderRadius: 6,
              border: '1px dashed #d9d9d9',
            }}
          >
            <Text type="secondary">Sin imágenes para esta variante</Text>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                style={{
                  border: image.isPrimary ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <Image
                  src={image.imageUrl}
                  alt=""
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  preview={{ mask: 'Ver' }}
                />
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    {image.isPrimary ? (
                      <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                        ★ Principal
                      </Tag>
                    ) : (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleSetPrimary(image.id)}
                        style={{ fontSize: 11, padding: 0, height: 'auto' }}
                      >
                        Hacer principal
                      </Button>
                    )}
                  </div>
                  <Button
                    danger
                    size="small"
                    block
                    icon={<IconTrash size={14} />}
                    onClick={() => handleDelete(image.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
