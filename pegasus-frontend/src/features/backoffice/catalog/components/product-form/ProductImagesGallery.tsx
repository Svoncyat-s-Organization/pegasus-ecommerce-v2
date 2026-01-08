import { useState } from 'react';
import { Button, Image, Empty, Popconfirm, message, Modal, Spin, theme } from 'antd';
import { IconPlus, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useImagesByProduct, useCreateImage, useDeleteImage, useUpdateImage } from '../../hooks/useImages';
import { ImageUploader } from '@shared/components/ImageUploader';
import type { ImageResponse } from '@types';

interface ProductImagesGalleryProps {
  productId: number;
}

/**
 * Galería de imágenes del producto (no variantes)
 * Permite subir, eliminar y establecer imagen principal
 */
export const ProductImagesGallery = ({ productId }: ProductImagesGalleryProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: images, isLoading } = useImagesByProduct(productId);
  const createMutation = useCreateImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();

  const handleImageUploaded = async (url: string | undefined) => {
    if (!url) return;

    try {
      await createMutation.mutateAsync({
        imageUrl: url,
        productId,
        variantId: undefined,
        isPrimary: !images || images.length === 0, // Primera imagen es principal
        displayOrder: images?.length || 0,
      });
      message.success('Imagen agregada');
      setIsUploadModalOpen(false);
    } catch {
      // Error manejado por el hook
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSetPrimary = async (image: ImageResponse) => {
    if (image.isPrimary) return;

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
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onSetPrimary={handleSetPrimary}
            onDelete={handleDelete}
          />
        ))}
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
  image: ImageResponse;
  onSetPrimary: (image: ImageResponse) => void;
  onDelete: (id: number) => void;
}

const ImageCard = ({ image, onSetPrimary, onDelete }: ImageCardProps) => {
  const { token } = theme.useToken();
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
        alt={`Imagen ${image.id}`}
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
          onClick={() => onSetPrimary(image)}
          disabled={image.isPrimary}
          title={image.isPrimary ? 'Imagen principal' : 'Establecer como principal'}
        />

        <Popconfirm
          title="¿Eliminar imagen?"
          onConfirm={() => onDelete(image.id)}
          okText="Eliminar"
          cancelText="Cancelar"
        >
          <Button type="text" danger size="small" icon={<IconTrash size={16} />} title="Eliminar" />
        </Popconfirm>
      </div>
    </div>
  );
};
