import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Tooltip,
  Typography,
  Alert,
  theme,
} from 'antd';
import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import { useUpdateProduct } from '../../hooks/useProducts';
import { useCategorySpecificationsWithInheritance } from '../../hooks/useCategorySpecifications';
import type { CategorySpecificationResponse } from '@types';

const { Text } = Typography;

interface SpecValue {
  key: string;
  displayName: string;
  value: string;
  specType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
  unit?: string;
  options?: string[];
  isRequired: boolean;
}

interface CategoryBasedSpecsEditorProps {
  productId: number;
  categoryId?: number;
  initialSpecs?: Record<string, unknown>;
}

/**
 * Editor de especificaciones técnicas basado en la categoría del producto.
 * Carga las especificaciones definidas a nivel de categoría y permite completar los valores.
 */
export const CategoryBasedSpecsEditor = ({
  productId,
  categoryId,
  initialSpecs,
}: CategoryBasedSpecsEditorProps) => {
  const { token } = theme.useToken();
  const updateMutation = useUpdateProduct();

  // Cargar specs de la categoría (con herencia)
  const { data: categorySpecs, isLoading: isLoadingSpecs } = useCategorySpecificationsWithInheritance(
    categoryId || 0
  );

  const [specValues, setSpecValues] = useState<SpecValue[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar valores cuando cargan las specs de categoría
  useEffect(() => {
    if (categorySpecs && categorySpecs.length > 0) {
      const values: SpecValue[] = categorySpecs.map((spec: CategorySpecificationResponse) => ({
        key: spec.name,
        displayName: spec.displayName,
        value: initialSpecs?.[spec.name] !== undefined ? String(initialSpecs[spec.name]) : '',
        specType: spec.specType,
        unit: spec.unit || undefined,
        options: spec.options || undefined,
        isRequired: spec.isRequired,
      }));
      setSpecValues(values);
    }
  }, [categorySpecs, initialSpecs]);

  const handleSpecValueChange = (index: number, newValue: string) => {
    setSpecValues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: newValue };
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validar campos requeridos
    const missingRequired = specValues.filter((s) => s.isRequired && !s.value.trim());
    if (missingRequired.length > 0) {
      message.error(`Faltan campos requeridos: ${missingRequired.map((s) => s.displayName).join(', ')}`);
      return;
    }

    // Construir objeto de specs
    const specsObject: Record<string, string | number | boolean> = {};

    specValues.forEach((spec) => {
      if (spec.value.trim()) {
        if (spec.specType === 'NUMBER') {
          specsObject[spec.key] = parseFloat(spec.value) || 0;
        } else if (spec.specType === 'BOOLEAN') {
          specsObject[spec.key] = spec.value === 'true';
        } else {
          specsObject[spec.key] = spec.value.trim();
        }
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

  const renderSpecInput = (spec: SpecValue, index: number) => {
    switch (spec.specType) {
      case 'SELECT':
        return (
          <Select
            value={spec.value || undefined}
            onChange={(val) => handleSpecValueChange(index, val || '')}
            placeholder={`Seleccionar ${spec.displayName.toLowerCase()}`}
            style={{ width: '100%' }}
            allowClear
            options={spec.options?.map((opt) => ({ label: opt, value: opt })) || []}
          />
        );
      case 'NUMBER':
        return (
          <InputNumber
            value={spec.value ? parseFloat(spec.value) : undefined}
            onChange={(val) => handleSpecValueChange(index, val !== null ? String(val) : '')}
            placeholder={`Ingrese ${spec.displayName.toLowerCase()}`}
            style={{ width: '100%' }}
            addonAfter={spec.unit}
          />
        );
      case 'BOOLEAN':
        return (
          <Switch
            checked={spec.value === 'true'}
            onChange={(checked) => handleSpecValueChange(index, String(checked))}
            checkedChildren="Sí"
            unCheckedChildren="No"
          />
        );
      default: // TEXT
        return (
          <Input
            value={spec.value}
            onChange={(e) => handleSpecValueChange(index, e.target.value)}
            placeholder={`Ingrese ${spec.displayName.toLowerCase()}`}
            addonAfter={spec.unit}
          />
        );
    }
  };

  if (isLoadingSpecs) {
    return <div style={{ padding: 16 }}>Cargando especificaciones...</div>;
  }

  // Si no hay categoría seleccionada
  if (!categoryId) {
    return (
      <Alert
        type="info"
        showIcon
        message="Selecciona una categoría"
        description="Las especificaciones se cargarán automáticamente según la categoría seleccionada."
      />
    );
  }

  // Si la categoría no tiene specs definidas
  if (specValues.length === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Sin especificaciones definidas"
        description={
          <span>
            La categoría seleccionada no tiene especificaciones definidas. Puedes{' '}
            <strong>definirlas en Catálogo → Categorías</strong> usando el botón de especificaciones.
          </span>
        }
      />
    );
  }

  return (
    <div>
      {/* Lista de specs en formato de formulario */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(150px, 200px) 1fr',
          gap: '12px 16px',
          alignItems: 'center',
          maxWidth: 600,
          marginBottom: 16,
        }}
      >
        {specValues.map((spec, index) => (
          <>
            <div key={`label-${spec.key}`} style={{ textAlign: 'right' }}>
              <Text strong>
                {spec.displayName}
                {spec.isRequired && <span style={{ color: token.colorError }}> *</span>}
              </Text>
              {spec.unit && (
                <Tooltip title={`Unidad: ${spec.unit}`}>
                  <IconInfoCircle
                    size={12}
                    style={{ marginLeft: 4, color: token.colorTextSecondary }}
                  />
                </Tooltip>
              )}
            </div>
            <div key={`input-${spec.key}`}>{renderSpecInput(spec, index)}</div>
          </>
        ))}
      </div>

      {/* Botón guardar */}
      <Button
        type="primary"
        icon={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        disabled={!hasChanges}
        loading={updateMutation.isPending}
      >
        Guardar especificaciones
      </Button>
    </div>
  );
};
