import { useState, useEffect } from 'react';
import {
  Button,
  Select,
  Space,
  Empty,
  Card,
  Tag,
  Modal,
  message,
  Tooltip,
  theme,
  Input,
  Checkbox,
} from 'antd';
import {
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconX,
  IconInfoCircle,
  IconGripVertical,
} from '@tabler/icons-react';
import {
  useProductVariantAttributes,
  useSaveAllProductVariantAttributes,
} from '../../hooks/useProductVariantAttributes';
import { useAllActiveVariantAttributes } from '../../hooks/useVariantAttributes';
import type { ProductVariantAttributeResponse, VariantAttributeResponse } from '@types';

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
  productId: number;
}

/**
 * Editor para asignar atributos del catálogo global a un producto.
 * Permite seleccionar qué atributos usar para las variantes y personalizar opciones.
 */
export const ProductVariantAttributesEditor = ({ productId }: ProductVariantAttributesEditorProps) => {
  const { token } = theme.useToken();
  const { data: assignedAttributes, isLoading: isLoadingAssigned } = useProductVariantAttributes(productId);
  const { data: allAttributes, isLoading: isLoadingAll } = useAllActiveVariantAttributes();
  const saveMutation = useSaveAllProductVariantAttributes();

  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  // Sincronizar datos del servidor
  useEffect(() => {
    if (assignedAttributes && !hasChanges) {
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
  }, [assignedAttributes, hasChanges]);

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

    setLocalAttributes((prev) => [...prev, newAttr]);
    setHasChanges(true);
  };

  const handleRemoveAttribute = (index: number) => {
    Modal.confirm({
      title: '¿Desasignar este atributo?',
      content: 'Las variantes que usen este atributo perderán sus valores.',
      okText: 'Desasignar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setLocalAttributes((prev) => prev.filter((_, i) => i !== index));
        setHasChanges(true);
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
      variantAttributeId: attr.variantAttributeId,
      customOptions: attr.useCustomOptions ? attr.customOptions : [],
      position: index,
    }));

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
      <Empty
        description="No hay atributos de variante asignados"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Space direction="vertical" align="center">
          {availableAttributes.length > 0 ? (
            <Select
              placeholder="Seleccionar atributo del catálogo"
              style={{ width: 280 }}
              onChange={handleAddAttribute}
              value={undefined}
              options={availableAttributes.map((a: VariantAttributeResponse) => ({
                value: a.id,
                label: (
                  <Space>
                    <span>{a.displayName}</span>
                    <Tag color="blue">{a.name}</Tag>
                  </Space>
                ),
              }))}
            />
          ) : (
            <span style={{ color: token.colorTextSecondary }}>
              No hay atributos disponibles en el catálogo
            </span>
          )}
          <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>
            Gestiona el catálogo global en Catálogo → Atributos de variantes
          </span>
        </Space>
      </Empty>
    );
  }

  return (
    <div>
      {/* Lista de atributos asignados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {localAttributes.map((attr, attrIndex) => (
          <Card
            key={`${attr.variantAttributeId}-${attrIndex}`}
            size="small"
            title={
              <Space>
                <IconGripVertical size={14} style={{ color: token.colorTextTertiary, cursor: 'grab' }} />
                <span>{attr.displayName}</span>
                <Tag color="blue">{attr.attributeName}</Tag>
              </Space>
            }
            extra={
              <Button
                type="text"
                danger
                size="small"
                icon={<IconTrash size={16} />}
                onClick={() => handleRemoveAttribute(attrIndex)}
              />
            }
            styles={{ body: { padding: 16 } }}
          >
            {/* Opciones base del catálogo */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: token.colorTextSecondary, display: 'block', marginBottom: 8 }}>
                Opciones del catálogo global
                <Tooltip title="Selecciona las opciones que aplican a este producto">
                  <IconInfoCircle size={12} style={{ marginLeft: 4 }} />
                </Tooltip>
              </label>
              <Space size={[4, 8]} wrap>
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
              <label style={{ fontSize: 12, color: token.colorTextSecondary, display: 'block', marginBottom: 8 }}>
                Opciones adicionales (solo este producto)
              </label>

              {/* Mostrar opciones custom que no están en base */}
              {attr.customOptions.filter((o) => !attr.baseOptions.includes(o)).length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Space size={[4, 4]} wrap>
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
                          style={{ margin: 0 }}
                          color="orange"
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
                <Button icon={<IconPlus size={16} />} onClick={() => handleAddCustomOption(attrIndex)}>
                  Agregar
                </Button>
              </Space.Compact>
            </div>
          </Card>
        ))}
      </div>

      {/* Selector para agregar más atributos */}
      {availableAttributes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Agregar otro atributo del catálogo"
            style={{ width: 280 }}
            onChange={handleAddAttribute}
            value={undefined}
            options={availableAttributes.map((a: VariantAttributeResponse) => ({
              value: a.id,
              label: (
                <Space>
                  <span>{a.displayName}</span>
                  <Tag color="blue">{a.name}</Tag>
                </Space>
              ),
            }))}
          />
        </div>
      )}

      {/* Acciones */}
      <Space>
        <Button
          type="primary"
          icon={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          disabled={!hasChanges}
          loading={saveMutation.isPending}
        >
          Guardar atributos
        </Button>
      </Space>
    </div>
  );
};
