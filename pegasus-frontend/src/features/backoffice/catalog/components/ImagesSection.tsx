import { useState } from 'react';
import { Tabs, Upload, Button, Space, Image, Empty, Popconfirm, message, Select } from 'antd';
import { IconUpload, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useImagesByProduct, useImagesByVariant, useCreateImage, useDeleteImage, useUpdateImage } from '../hooks/useImages';
import { useVariantsByProduct } from '../hooks/useVariants';
import type { ImageResponse } from '@types';

interface ImagesSectionProps {
  productId: number;
}

export const ImagesSection = ({ productId }: ImagesSectionProps) => {
  const [activeTab, setActiveTab] = useState<'product' | 'variant'>('product');
  const [selectedVariantId, setSelectedVariantId] = useState<number>();

  // Queries
  const { data: productImages, isLoading: isLoadingProductImages } = useImagesByProduct(productId);
  const { data: variantImages, isLoading: isLoadingVariantImages } = useImagesByVariant(selectedVariantId || 0);
  const { data: variants } = useVariantsByProduct(productId);

  // Mutations
  const createMutation = useCreateImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();

  const handleUpload = async (file: File) => {
    // TODO: Implementar upload real a un servicio de almacenamiento (S3, Cloudinary, etc.)
    // Por ahora usamos una URL de placeholder
    const fakeUrl = `https://via.placeholder.com/800x600?text=${file.name}`;
    
    try {
      await createMutation.mutateAsync({
        imageUrl: fakeUrl,
        productId,
        variantId: activeTab === 'variant' ? selectedVariantId : undefined,
        isPrimary: false,
        displayOrder: 0,
      });
      message.success('Imagen agregada exitosamente');
    } catch {
      // Error manejado por el hook
    }
    
    return false; // Evita el upload automático de Ant Design
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSetPrimary = async (image: ImageResponse) => {
    try {
      await updateMutation.mutateAsync({
        id: image.id,
        request: { isPrimary: true },
      });
      message.success('Imagen principal establecida');
    } catch {
      // Error manejado por el hook
    }
  };

  const renderImageGallery = (images: ImageResponse[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return <div>Cargando...</div>;
    }

    if (!images || images.length === 0) {
      return (
        <Empty description="No hay imágenes" style={{ margin: '40px 0' }}>
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button type="primary" icon={<IconUpload size={16} />}>
              Subir Primera Imagen
            </Button>
          </Upload>
        </Empty>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<IconUpload size={16} />}>
              Agregar Imagen
            </Button>
          </Upload>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                border: image.isPrimary ? '2px solid #1890ff' : '1px solid #d9d9d9',
                borderRadius: 8,
                padding: 8,
                position: 'relative',
              }}
            >
              <Image
                src={image.imageUrl}
                alt={`Imagen ${image.id}`}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 }}
              />
              
              <Space style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
                <Button
                  type="text"
                  size="small"
                  icon={image.isPrimary ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                  onClick={() => handleSetPrimary(image)}
                  disabled={image.isPrimary}
                  title={image.isPrimary ? 'Imagen principal' : 'Marcar como principal'}
                />
                
                <Popconfirm
                  title="¿Eliminar imagen?"
                  onConfirm={() => handleDelete(image.id)}
                  okText="Eliminar"
                  cancelText="Cancelar"
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<IconTrash size={16} />}
                    title="Eliminar"
                  />
                </Popconfirm>
              </Space>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'product',
      label: 'Imágenes Generales',
      children: renderImageGallery(productImages, isLoadingProductImages),
    },
    {
      key: 'variant',
      label: 'Imágenes por Variante',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Select
              placeholder="Seleccionar variante"
              style={{ width: 300 }}
              value={selectedVariantId}
              onChange={setSelectedVariantId}
              options={variants?.map((variant) => ({
                label: `${variant.sku} - ${formatCurrency(variant.price)}`,
                value: variant.id,
              }))}
            />
          </div>
          
          {selectedVariantId ? (
            renderImageGallery(variantImages, isLoadingVariantImages)
          ) : (
            <Empty description="Selecciona una variante para ver sus imágenes" />
          )}
        </div>
      ),
    },
  ];

  return <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'product' | 'variant')} items={tabItems} />;
};

function formatCurrency(price: number): string {
  return `S/ ${price.toFixed(2)}`;
}
