import { useState, useCallback } from 'react';

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface UseCloudinaryUploadOptions {
  folder?: string;
  maxSizeMB?: number;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<string>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  reset: () => void;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const useCloudinaryUpload = (
  options: UseCloudinaryUploadOptions = {}
): UseCloudinaryUploadReturn => {
  const { folder = 'pegasus', maxSizeMB = 5 } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      // Validate configuration
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        const errorMsg = 'Cloudinary no está configurado. Verifica las variables de entorno.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate file type
      if (!ALLOWED_FORMATS.includes(file.type)) {
        const errorMsg = 'Formato no permitido. Usa JPG, PNG, WebP o GIF.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `El archivo excede el límite de ${maxSizeMB}MB.`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        const response = await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Error de red al subir la imagen'));
          });

          xhr.open('POST', CLOUDINARY_URL);
          xhr.send(formData);
        });

        setProgress(100);
        return response.secure_url;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al subir la imagen';
        setError(errorMsg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB]
  );

  return {
    upload,
    isUploading,
    error,
    progress,
    reset,
  };
};
