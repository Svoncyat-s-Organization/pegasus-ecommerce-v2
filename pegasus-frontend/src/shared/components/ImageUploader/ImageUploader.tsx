import { useState, useRef } from 'react';
import { Input, Button, Space, Image, Progress, Alert, Spin, Divider } from 'antd';
import { IconLink, IconTrash, IconPhoto, IconCheck } from '@tabler/icons-react';
import { useCloudinaryUpload } from '@shared/hooks/useCloudinaryUpload';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  placeholder?: string;
  disabled?: boolean;
  showPreview?: boolean;
  aspectRatio?: string; // e.g., "16/9", "1/1", "4/3"
}

export const ImageUploader = ({
  value,
  onChange,
  folder = 'general',
  placeholder = 'https://ejemplo.com/imagen.jpg',
  disabled = false,
  showPreview = true,
  aspectRatio = '16/9',
}: ImageUploaderProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { upload, isUploading, error: uploadError, progress, reset } = useCloudinaryUpload({
    folder: `pegasus/${folder}`,
    maxSizeMB: 5,
  });

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('La URL no puede estar vacía');
      return false;
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('La URL debe empezar con http:// o https://');
        return false;
      }
    } catch {
      setUrlError('URL inválida');
      return false;
    }

    // Check for common image extensions or known image hosts
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const imageHosts = ['cloudinary.com', 'imgur.com', 'ibb.co', 'picsum.photos', 'unsplash.com', 'placeholder.com'];
    
    const isImageExtension = imageExtensions.test(url);
    const isImageHost = imageHosts.some(host => url.includes(host));

    if (!isImageExtension && !isImageHost) {
      setUrlError('La URL no parece ser una imagen válida');
      return false;
    }

    setUrlError(null);
    return true;
  };

  const handleUrlSubmit = () => {
    if (validateImageUrl(urlInput)) {
      onChange(urlInput);
      setUrlInput('');
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const url = await upload(file);
      onChange(url);
    } catch {
      // Error already handled by hook
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    reset();
  };

  // If there's already a value, show the preview with option to change
  if (value && showPreview) {
    return (
      <div style={{ width: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            aspectRatio,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#fafafa',
          }}
        >
          <Image
            src={value}
            alt="Imagen seleccionada"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5FcnJvcjwvdGV4dD48L3N2Zz4="
          />
          
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
            }}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<IconTrash size={14} />}
              onClick={handleRemove}
              disabled={disabled}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
          backgroundColor: isDragging ? '#e6f7ff' : '#fafafa',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {isUploading ? (
          <div>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>
              <Progress percent={progress} size="small" status="active" />
              <p style={{ marginTop: 8, color: '#666', marginBottom: 0 }}>Subiendo imagen...</p>
            </div>
          </div>
        ) : (
          <div>
            <IconPhoto size={40} style={{ color: '#bfbfbf', marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 14, color: '#262626' }}>
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 12 }}>
              JPG, PNG, WebP o GIF (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <Alert
          type="error"
          message={uploadError}
          showIcon
          closable
          onClose={reset}
          style={{ marginTop: 12 }}
        />
      )}

      {/* Divider */}
      <Divider style={{ margin: '16px 0', fontSize: 12, color: '#8c8c8c' }}>
        o ingresa una URL
      </Divider>

      {/* URL Input */}
      <Space.Compact style={{ width: '100%' }}>
        <Input
          prefix={<IconLink size={16} />}
          placeholder={placeholder}
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setUrlError(null);
          }}
          onPressEnter={handleUrlSubmit}
          disabled={disabled || isUploading}
          status={urlError ? 'error' : undefined}
        />
        <Button
          type="primary"
          icon={<IconCheck size={16} />}
          onClick={handleUrlSubmit}
          disabled={disabled || isUploading || !urlInput.trim()}
        >
          Usar
        </Button>
      </Space.Compact>

      {urlError && (
        <Alert
          type="error"
          message={urlError}
          showIcon
          closable
          onClose={() => setUrlError(null)}
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};
