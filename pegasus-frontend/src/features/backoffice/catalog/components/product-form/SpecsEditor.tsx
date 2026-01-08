import { useState, useCallback } from 'react';
import { Button, Input, Space, Empty, message } from 'antd';
import { IconPlus, IconTrash, IconDeviceFloppy } from '@tabler/icons-react';
import { useUpdateProduct } from '../../hooks/useProducts';

interface SpecEntry {
  key: string;
  value: string;
}

interface SpecsEditorProps {
  productId: number;
  initialSpecs?: Record<string, unknown>;
}

/**
 * Editor de especificaciones técnicas del producto
 * Permite agregar pares clave-valor para características como: display, procesador, memoria, etc.
 */
export const SpecsEditor = ({ productId, initialSpecs }: SpecsEditorProps) => {
  const updateMutation = useUpdateProduct();

  // Convertir specs del producto a array editable
  const getInitialEntries = useCallback((): SpecEntry[] => {
    if (!initialSpecs || Object.keys(initialSpecs).length === 0) return [];
    return Object.entries(initialSpecs).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }, [initialSpecs]);

  const [specs, setSpecs] = useState<SpecEntry[]>(getInitialEntries);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
    setHasChanges(true);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', newValue: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Filtrar specs vacíos y convertir a objeto
    const specsObject: Record<string, string> = {};
    specs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObject[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      await updateMutation.mutateAsync({
        id: productId,
        request: { specs: specsObject },
      });
      message.success('Especificaciones guardadas');
      setHasChanges(false);
    } catch {
      // Error manejado por el hook
    }
  };

  if (specs.length === 0) {
    return (
      <Empty description="Sin especificaciones" image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <Button type="primary" icon={<IconPlus size={16} />} onClick={handleAddSpec}>
          Agregar especificación
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      {/* Lista de especificaciones */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 16,
          maxWidth: 800,
        }}
      >
        {specs.map((spec, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              placeholder="Nombre (ej: Pantalla)"
              value={spec.key}
              onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="Valor (ej: 6.7 pulgadas Super Retina XDR)"
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

      {/* Acciones */}
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
          Guardar especificaciones
        </Button>
      </Space>
    </div>
  );
};
