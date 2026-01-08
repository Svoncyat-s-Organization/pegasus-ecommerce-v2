import { useState } from 'react';
import { Button, Image, Empty, Popconfirm, message, Modal, Spin, theme } from 'antd';
import { IconPlus, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useImagesByProduct, useCreateImage, useDeleteImage, useUpdateImage } from '../../hooks/useImages';
import { ImageUploader } from '@shared/components/ImageUploader';
import type { ImageResponse } from '@types';

interface LocalImage {
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  id: string; // temporary ID for local mode
}

interface ProductImagesGalleryProps {
  productId?: number;
  localMode?: boolean;
  onLocalChange?: (images: LocalImage[]) => void;
}

/**
 * Galería de imágenes del producto (no variantes)
 * Permite subir, eliminar y establecer imagen principal
 */
export const ProductImagesGallery = ({ 
  productId, 
  localMode = false,
  onLocalChange,
}: ProductImagesGalleryProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);

  const { data: serverImages, isLoading } = useImagesByProduct(productId || 0, { enabled: !localMode && !!productId });
  const createMutation = useCreateImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();

  const images = localMode ? localImages : serverImages;

  const handleImageUploaded = async (url: string | undefined) => {
    if (!url) return;

    if (localMode) {
      // Local mode: add to local state
      const newImage: LocalImage = {
        imageUrl: url,
        isPrimary: localImages.length === 0,
        displayOrder: localImages.length,
        id: `temp-${Date.now()}`,
      };
      const updated = [...localImages, newImage];
      setLocalImages(updated);
      onLocalChange?.(updated);
      message.success('Imagen agregada (se guardará al crear el producto)');
      setIsUploadModalOpen(false);
      return;
    }

    // Server mode: save to database
    if (!productId) return;

    try {
      await createMutation.mutateAsync({
        imageUrl: url,
        productId,
        variantId: undefined,
        isPrimary: !images || images.length === 0,
        displayOrder: images?.length || 0,
      });
      message.success('Imagen agregada');
      setIsUploadModalOpen(false);
    } catch {
      // Error manejado por el hook
    }
  };

  const handleDelete = (idOrTempId: number | string) => {
    if (localMode) {
      // Local mode: remove from local state
      const updated = localImages.filter((img) => img.id !== idOrTempId);
      setLocalImages(updated);
      onLocalChange?.(updated);
      message.success('Imagen eliminada');
      return;
    }

    // Server mode: delete from database
    if (typeof idOrTempId === 'number') {
      deleteMutation.mutate(idOrTempId);
    }
  };

  const handleSetPrimary = async (imageIdOrTemp: number | string) => {
    if (localMode) {
      // Local mode: update local state
      const updated = localImages.map((img: LocalImage) => ({
        ...img,
        isPrimary: img.id === imageIdOrTemp,
      }));
      setLocalImages(updated);
      onLocalChange?.(updated);
      message.success('Imagen principal actualizada');
      return;
    }

    // Server mode: update in database
    const image = images?.find((img) => 'id' in img && typeof img.id === 'number' && img.id === imageIdOrTemp) as ImageResponse | undefined;
    if (!image || image.isPrimary) return;

    try {
      await updateMutation.mutateAsync({
        id: image.id,
        request: { isPrimary: true },
      });
      message.success('Imagen principal actualizada');
    } catch {
      // Error manejado por el hook
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <Spin />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <>
        <Empty description="Sin imágenes" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" icon={<IconPlus size={16} />} onClick={() => setIsUploadModalOpen(true)}>
            Agregar imagen
          </Button>
        </Empty>

        <Modal
          title="Subir Imagen"
          open={isUploadModalOpen}
          onCancel={() => setIsUploadModalOpen(false)}
          footer={null}
          width={480}
          destroyOnClose
        >
          <div style={{ marginTop: 16 }}>
            <ImageUploader onChange={handleImageUploaded} folder="products" showPreview={false} />
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      {/* Botón agregar */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<IconPlus size={16} />} onClick={() => setIsUploadModalOpen(true)}>
          Agregar imagen
        </Button>
      </div>

      {/* Grid de imágenes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {images.map((image: ImageResponse | LocalImage) => {
          const imgId = 'id' in image && typeof image.id === 'number' ? image.id : (image as LocalImage).id;
          return (
            <ImageCard
              key={imgId}
              image={image}
              onSetPrimary={() => handleSetPrimary(imgId)}
              onDelete={() => handleDelete(imgId)}
            />
          );
        })}
      </div>

      {/* Modal de subida */}
      <Modal
        title="Subir Imagen"
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <ImageUploader onChange={handleImageUploaded} folder="products" showPreview={false} />
        </div>
      </Modal>
    </>
  );
};

// Componente interno para cada imagen
interface ImageCardProps {
  image: ImageResponse | LocalImage;
  onSetPrimary: () => void;
  onDelete: () => void;
}

const ImageCard = ({ image, onSetPrimary, onDelete }: ImageCardProps) => {
  const { token } = theme.useToken();
  const imageId = 'id' in image && typeof image.id === 'number' 
    ? image.id 
    : (image as LocalImage).id || 'temp';
  
  return (
    <div
      style={{
        border: image.isPrimary ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: token.colorBgLayout,
      }}
    >
      <Image
        src={image.imageUrl}
        alt={`Imagen ${imageId}`}
        style={{ width: '100%', height: 140, objectFit: 'cover' }}
        preview={{ mask: 'Ver' }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 8px',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={image.isPrimary ? <IconStarFilled size={16} color={token.colorWarning} /> : <IconStar size={16} />}
          onClick={onSetPrimary}
          disabled={image.isPrimary}
          title={image.isPrimary ? 'Imagen principal' : 'Establecer como principal'}
        />

        <Popconfirm
          title="¿Eliminar imagen?"
          onConfirm={onDelete}
          okText="Eliminar"
          cancelText="Cancelar"
        >
          <Button type="text" danger size="small" icon={<IconTrash size={16} />} title="Eliminar" />
        </Popconfirm>
      </div>
    </div>
  );
};
