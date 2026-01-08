import { useState, useMemo, useCallback } from 'react';
import { Button, Input, Space, Typography, Empty } from 'antd';
import { IconPlus, IconTrash, IconDeviceFloppy } from '@tabler/icons-react';
import { useProduct, useUpdateProduct } from '../hooks/useProducts';

const { Text } = Typography;

interface SpecEntry {
  key: string;
  value: string;
}

interface SpecsSectionProps {
  productId: number;
}

export const SpecsSection = ({ productId }: SpecsSectionProps) => {
  const { data: product, isLoading } = useProduct(productId);
  const updateMutation = useUpdateProduct();

  // Derivar specs iniciales del producto
  const initialSpecs = useMemo<SpecEntry[]>(() => {
    if (!product?.specs) return [];
    return Object.entries(product.specs).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }, [product]);

  const [specs, setSpecs] = useState<SpecEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sincronizar specs con los datos del producto (una sola vez)
  const displaySpecs = useMemo(() => {
    if (!isInitialized && initialSpecs.length > 0) {
      return initialSpecs;
    }
    return hasChanges ? specs : initialSpecs;
  }, [initialSpecs, specs, hasChanges, isInitialized]);

  const handleAddSpec = useCallback(() => {
    if (!isInitialized) {
      setSpecs([...initialSpecs, { key: '', value: '' }]);
      setIsInitialized(true);
    } else {
      setSpecs((prev) => [...prev, { key: '', value: '' }]);
    }
    setHasChanges(true);
  }, [initialSpecs, isInitialized]);

  const handleRemoveSpec = useCallback((index: number) => {
    const currentSpecs = isInitialized ? specs : initialSpecs;
    const newSpecs = currentSpecs.filter((_, i) => i !== index);
    setSpecs(newSpecs);
    setIsInitialized(true);
    setHasChanges(true);
  }, [specs, initialSpecs, isInitialized]);

  const handleSpecChange = useCallback((index: number, field: 'key' | 'value', newValue: string) => {
    const currentSpecs = isInitialized ? specs : initialSpecs;
    const newSpecs = [...currentSpecs];
    newSpecs[index][field] = newValue;
    setSpecs(newSpecs);
    setIsInitialized(true);
    setHasChanges(true);
  }, [specs, initialSpecs, isInitialized]);

  const handleSave = async () => {
    // Filtrar specs vacíos y convertir a objeto
    const currentSpecs = isInitialized ? specs : initialSpecs;
    const specsObject: Record<string, string> = {};
    currentSpecs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObject[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      await updateMutation.mutateAsync({
        id: productId,
        request: { specs: specsObject },
      });
      setHasChanges(false);
    } catch {
      // Error manejado por el hook
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong>Especificaciones Técnicas</Text>
          <br />
          <Text type="secondary">
            Define las características técnicas del producto (display, procesador, memoria, etc.)
          </Text>
        </div>
        <Space>
          <Button icon={<IconPlus size={16} />} onClick={handleAddSpec}>
            Agregar
          </Button>
          <Button
            type="primary"
            icon={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            disabled={!hasChanges}
            loading={updateMutation.isPending}
          >
            Guardar
          </Button>
        </Space>
      </div>

      {displaySpecs.length === 0 ? (
        <Empty
          description="No hay especificaciones definidas"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<IconPlus size={16} />} onClick={handleAddSpec}>
            Agregar primera especificación
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displaySpecs.map((spec, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                placeholder="Nombre (ej: display)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                style={{ width: 200 }}
              />
              <Input
                placeholder="Valor (ej: 6.1 pulgadas OLED)"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="text"
                danger
                icon={<IconTrash size={16} />}
                onClick={() => handleRemoveSpec(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
