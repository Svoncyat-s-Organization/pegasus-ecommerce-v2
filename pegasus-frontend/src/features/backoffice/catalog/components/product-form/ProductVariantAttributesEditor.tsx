import { useState, useEffect } from 'react';
import {
  Button,
  Select,
  Space,
  Card,
  Tag,
  Modal,
  message,
  Input,
  Checkbox,
  Typography,
} from 'antd';
import {
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
import {
  useProductVariantAttributes,
  useSaveAllProductVariantAttributes,
} from '../../hooks/useProductVariantAttributes';
import { useAllActiveVariantAttributes } from '../../hooks/useVariantAttributes';
import type { ProductVariantAttributeResponse, VariantAttributeResponse } from '@types';

const { Text } = Typography;

export interface LocalVariantAttribute {
  variantAttributeId: number;
  customOptions?: string[];
  position?: number;
  attributeName?: string;
  attributeDisplayName?: string;
}

interface LocalAttribute {
  id?: number; // undefined if new
  variantAttributeId: number;
  attributeName: string;
  displayName: string;
  baseOptions: string[]; // opciones del catálogo global
  customOptions: string[]; // opciones personalizadas o seleccionadas
  useCustomOptions: boolean;
  position: number;
}

interface ProductVariantAttributesEditorProps {
  productId?: number;
  localMode?: boolean;
  onLocalChange?: (attributes: LocalVariantAttribute[]) => void;
}

/**
 * Editor para asignar atributos del catálogo global a un producto.
 * Permite seleccionar qué atributos usar para las variantes y personalizar opciones.
 */
export const ProductVariantAttributesEditor = ({ 
  productId, 
  localMode = false,
  onLocalChange,
}: ProductVariantAttributesEditorProps) => {
  const { data: assignedAttributes, isLoading: isLoadingAssigned } = useProductVariantAttributes(
    productId || 0,
    { enabled: !localMode && !!productId }
  );
  const { data: allAttributes, isLoading: isLoadingAll } = useAllActiveVariantAttributes();
  const saveMutation = useSaveAllProductVariantAttributes();

  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  // Sincronizar datos del servidor
  useEffect(() => {
    if (assignedAttributes && !hasChanges && !localMode) {
      const mapped: LocalAttribute[] = assignedAttributes.map((attr: ProductVariantAttributeResponse) => ({
        id: attr.id,
        variantAttributeId: attr.variantAttributeId,
        attributeName: attr.attributeName,
        displayName: attr.attributeDisplayName,
        baseOptions: attr.globalOptions,
        customOptions: attr.customOptions && attr.customOptions.length > 0 
          ? attr.customOptions 
          : [...attr.globalOptions],
        useCustomOptions: !!(attr.customOptions && attr.customOptions.length > 0),
        position: attr.position,
      }));
      setLocalAttributes(mapped);
    }
  }, [assignedAttributes, hasChanges, localMode]);

  // Atributos disponibles (no asignados aún)
  const getAvailableAttributes = (): VariantAttributeResponse[] => {
    if (!allAttributes) return [];
    const assignedIds = localAttributes.map((a) => a.variantAttributeId);
    return allAttributes.filter((a: VariantAttributeResponse) => !assignedIds.includes(a.id));
  };

  const handleAddAttribute = (variantAttributeId: number) => {
    const globalAttr = allAttributes?.find((a: VariantAttributeResponse) => a.id === variantAttributeId);
    if (!globalAttr) return;

    const newAttr: LocalAttribute = {
      variantAttributeId: globalAttr.id,
      attributeName: globalAttr.name,
      displayName: globalAttr.displayName,
      baseOptions: globalAttr.options,
      customOptions: [...globalAttr.options],
      useCustomOptions: false,
      position: localAttributes.length,
    };

    const updated = [...localAttributes, newAttr];
    setLocalAttributes(updated);
    setHasChanges(true);
    
    // Notify parent in local mode
    if (localMode && onLocalChange) {
      onLocalChange(updated.map((attr, index) => ({
        variantAttributeId: attr.variantAttributeId,
        customOptions: attr.useCustomOptions ? attr.customOptions : [],
        position: index,
        attributeName: attr.attributeName,
        attributeDisplayName: attr.displayName,
      })));
    }
  };

  const handleRemoveAttribute = (index: number) => {
    Modal.confirm({
      title: '¿Desasignar este atributo?',
      content: 'Las variantes que usen este atributo perderán sus valores.',
      okText: 'Desasignar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        const updated = localAttributes.filter((_, i) => i !== index);
        setLocalAttributes(updated);
        setHasChanges(true);
        
        // Notify parent in local mode
        if (localMode && onLocalChange) {
          onLocalChange(updated.map((attr, idx) => ({
            variantAttributeId: attr.variantAttributeId,
            customOptions: attr.useCustomOptions ? attr.customOptions : [],
            position: idx,
            attributeName: attr.attributeName,
            attributeDisplayName: attr.displayName,
          })));
        }
      },
    });
  };

  const handleAddCustomOption = (attrIndex: number) => {
    const optionValue = newOptionInputs[attrIndex]?.trim();
    if (!optionValue) return;

    setLocalAttributes((prev) => {
      const updated = [...prev];
      if (!updated[attrIndex].customOptions.includes(optionValue)) {
        updated[attrIndex] = {
          ...updated[attrIndex],
          customOptions: [...updated[attrIndex].customOptions, optionValue],
          useCustomOptions: true,
        };
      }
      return updated;
    });
    setNewOptionInputs((prev) => ({ ...prev, [attrIndex]: '' }));
    setHasChanges(true);
  };

  const handleRemoveCustomOption = (attrIndex: number, optIndex: number) => {
    setLocalAttributes((prev) => {
      const updated = [...prev];
      const newCustomOptions = updated[attrIndex].customOptions.filter((_, i) => i !== optIndex);
      updated[attrIndex] = {
        ...updated[attrIndex],
        customOptions: newCustomOptions,
        useCustomOptions: true,
      };
      return updated;
    });
    setHasChanges(true);
  };

  const handleToggleBaseOption = (attrIndex: number, option: string, checked: boolean) => {
    setLocalAttributes((prev) => {
      const updated = [...prev];
      const currentCustom = updated[attrIndex].customOptions;
      
      if (checked && !currentCustom.includes(option)) {
        updated[attrIndex] = {
          ...updated[attrIndex],
          customOptions: [...currentCustom, option],
          useCustomOptions: true,
        };
      } else if (!checked) {
        updated[attrIndex] = {
          ...updated[attrIndex],
          customOptions: currentCustom.filter((o) => o !== option),
          useCustomOptions: true,
        };
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validar que todos tengan al menos una opción
    const invalidAttrs = localAttributes.filter((attr) => attr.customOptions.length === 0);

    if (invalidAttrs.length > 0) {
      Modal.error({
        title: 'Datos incompletos',
        content: 'Todos los atributos deben tener al menos una opción seleccionada.',
      });
      return;
    }

    const payload = localAttributes.map((attr, index) => ({
      id: attr.id, // Incluir el ID si existe (para actualización)
      variantAttributeId: attr.variantAttributeId,
      customOptions: attr.useCustomOptions ? attr.customOptions : [],
      position: index,
    }));

    // Local mode: just notify parent
    if (localMode && onLocalChange) {
      onLocalChange(localAttributes.map((attr, index) => ({
        variantAttributeId: attr.variantAttributeId,
        customOptions: attr.useCustomOptions ? attr.customOptions : [],
        position: index,
        attributeName: attr.attributeName,
        attributeDisplayName: attr.displayName,
      })));
      message.success('Atributos configurados (se guardarán al crear el producto)');
      setHasChanges(false);
      return;
    }

    // Server mode: save to database
    if (!productId) return;

    try {
      await saveMutation.mutateAsync({ productId, data: payload });
      message.success('Atributos guardados');
      setHasChanges(false);
    } catch {
      // Error manejado por el hook
    }
  };

  const isLoading = isLoadingAssigned || isLoadingAll;

  if (isLoading) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  const availableAttributes = getAvailableAttributes();

  if (localAttributes.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          background: '#fafafa',
          borderRadius: 6,
          border: '1px dashed #d9d9d9',
        }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          No hay atributos de variante asignados
        </Text>
        <Space direction="vertical" align="center" size={12}>
          {availableAttributes.length > 0 ? (
            <Select
              placeholder="Seleccionar atributo del catálogo"
              style={{ width: 300 }}
              onChange={handleAddAttribute}
              value={undefined}
              options={availableAttributes.map((a: VariantAttributeResponse) => ({
                value: a.id,
                label: `${a.displayName} (${a.name})`,
              }))}
            />
          ) : (
            <Text type="secondary">No hay atributos disponibles en el catálogo</Text>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            Gestiona el catálogo global en Catálogo → Atributos de variantes
          </Text>
        </Space>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
          Atributos de Variantes
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Selecciona los atributos del catálogo global que aplican a este producto. Puedes personalizar las opciones para cada atributo.
        </Text>
      </div>

      {/* Lista de atributos asignados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {localAttributes.map((attr, attrIndex) => (
          <Card
            key={`${attr.variantAttributeId}-${attrIndex}`}
            size="small"
            title={
              <Space>
                <Text strong>{attr.displayName}</Text>
                <Tag color="blue">{attr.attributeName}</Tag>
              </Space>
            }
            extra={
              <Button
                type="text"
                danger
                size="small"
                icon={<IconTrash size={16} />}
                title="Desasignar atributo"
                onClick={() => handleRemoveAttribute(attrIndex)}
              />
            }
          >
            {/* Opciones base del catálogo */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                Opciones del catálogo global
              </Text>
              <Space size={[8, 8]} wrap>
                {attr.baseOptions.map((option) => (
                  <Checkbox
                    key={option}
                    checked={attr.customOptions.includes(option)}
                    onChange={(e) => handleToggleBaseOption(attrIndex, option, e.target.checked)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Space>
            </div>

            {/* Opciones personalizadas adicionales */}
            <div>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                Opciones adicionales (solo este producto)
              </Text>

              {/* Mostrar opciones custom que no están en base */}
              {attr.customOptions.filter((o) => !attr.baseOptions.includes(o)).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Space size={[6, 6]} wrap>
                    {attr.customOptions
                      .filter((o) => !attr.baseOptions.includes(o))
                      .map((option) => (
                        <Tag
                          key={option}
                          closable
                          onClose={() => {
                            const realIndex = attr.customOptions.indexOf(option);
                            handleRemoveCustomOption(attrIndex, realIndex);
                          }}
                          closeIcon={<IconX size={10} />}
                          color="orange"
                          style={{ margin: 0 }}
                        >
                          {option}
                        </Tag>
                      ))}
                  </Space>
                </div>
              )}

              <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
                <Input
                  placeholder="Nueva opción personalizada"
                  value={newOptionInputs[attrIndex] || ''}
                  onChange={(e) =>
                    setNewOptionInputs((prev) => ({ ...prev, [attrIndex]: e.target.value }))
                  }
                  onPressEnter={() => handleAddCustomOption(attrIndex)}
                />
                <Button
                  type="default"
                  icon={<IconPlus size={16} />}
                  onClick={() => handleAddCustomOption(attrIndex)}
                >
                  Agregar
                </Button>
              </Space.Compact>
            </div>
          </Card>
        ))}
      </div>

      {/* Selector para agregar más atributos */}
      <Space size="middle">
        {availableAttributes.length > 0 && (
          <Select
            placeholder="Agregar otro atributo"
            style={{ width: 300 }}
            onChange={handleAddAttribute}
            value={undefined}
            options={availableAttributes.map((a: VariantAttributeResponse) => ({
              value: a.id,
              label: `${a.displayName} (${a.name})`,
            }))}
          />
        )}

        <Button
          type="primary"
          icon={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          disabled={!hasChanges}
          loading={saveMutation.isPending}
        >
          Guardar Cambios
        </Button>
      </Space>
    </div>
  );
};
