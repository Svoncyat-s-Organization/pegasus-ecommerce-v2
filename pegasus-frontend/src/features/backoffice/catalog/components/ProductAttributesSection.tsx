import { useState, useMemo, useCallback } from 'react';
import { Button, Input, Space, Typography, Empty, Card, Tag, Divider, Modal } from 'antd';
import { IconPlus, IconTrash, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useProductAttributes, useSaveAllProductAttributes } from '../hooks/useProductAttributes';
import type { CreateProductAttributeRequest } from '@types';

const { Text, Title } = Typography;

interface AttributeEntry {
  name: string;
  displayName: string;
  options: string[];
  position: number;
}

interface ProductAttributesSectionProps {
  productId: number;
}

export const ProductAttributesSection = ({ productId }: ProductAttributesSectionProps) => {
  const { data: existingAttributes, isLoading } = useProductAttributes(productId);
  const saveMutation = useSaveAllProductAttributes();

  const [attributes, setAttributes] = useState<AttributeEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [newOption, setNewOption] = useState<Record<number, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Derivar atributos iniciales
  const initialAttributes = useMemo<AttributeEntry[]>(() => {
    if (!existingAttributes) return [];
    return existingAttributes.map((attr) => ({
      name: attr.name,
      displayName: attr.displayName,
      options: attr.options,
      position: attr.position,
    }));
  }, [existingAttributes]);

  // Atributos a mostrar
  const displayAttributes = useMemo(() => {
    if (!isInitialized && initialAttributes.length >= 0) {
      return hasChanges ? attributes : initialAttributes;
    }
    return attributes;
  }, [initialAttributes, attributes, hasChanges, isInitialized]);

  const handleAddAttribute = useCallback(() => {
    const currentAttrs = isInitialized ? attributes : initialAttributes;
    setAttributes([
      ...currentAttrs,
      {
        name: '',
        displayName: '',
        options: [],
        position: currentAttrs.length,
      },
    ]);
    setIsInitialized(true);
    setHasChanges(true);
  }, [attributes, initialAttributes, isInitialized]);

  const handleRemoveAttribute = (index: number) => {
    Modal.confirm({
      title: '¿Eliminar atributo?',
      content: 'Esta acción eliminará el atributo y todas sus opciones.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        const currentAttrs = isInitialized ? attributes : initialAttributes;
        const newAttributes = currentAttrs.filter((_, i) => i !== index);
        // Reordenar posiciones
        newAttributes.forEach((attr, i) => {
          attr.position = i;
        });
        setAttributes(newAttributes);
        setIsInitialized(true);
        setHasChanges(true);
      },
    });
  };

  const handleAttributeChange = (
    index: number,
    field: 'name' | 'displayName',
    value: string
  ) => {
    const currentAttrs = isInitialized ? attributes : initialAttributes;
    const newAttributes = [...currentAttrs];
    newAttributes[index][field] = value;
    
    // Auto-generar name desde displayName si está vacío
    if (field === 'displayName' && !newAttributes[index].name) {
      newAttributes[index].name = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    }
    
    setAttributes(newAttributes);
    setIsInitialized(true);
    setHasChanges(true);
  };

  const handleAddOption = (attrIndex: number) => {
    const optionValue = newOption[attrIndex]?.trim();
    if (!optionValue) return;

    const currentAttrs = isInitialized ? attributes : initialAttributes;
    const newAttributes = [...currentAttrs];
    if (!newAttributes[attrIndex].options.includes(optionValue)) {
      newAttributes[attrIndex].options.push(optionValue);
      setAttributes(newAttributes);
      setIsInitialized(true);
      setHasChanges(true);
    }
    setNewOption({ ...newOption, [attrIndex]: '' });
  };

  const handleRemoveOption = (attrIndex: number, optionIndex: number) => {
    const currentAttrs = isInitialized ? attributes : initialAttributes;
    const newAttributes = [...currentAttrs];
    newAttributes[attrIndex].options.splice(optionIndex, 1);
    setAttributes(newAttributes);
    setIsInitialized(true);
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validar que todos los atributos tengan nombre, displayName y al menos una opción
    const currentAttrs = isInitialized ? attributes : initialAttributes;
    const invalidAttrs = currentAttrs.filter(
      (attr) => !attr.name.trim() || !attr.displayName.trim() || attr.options.length === 0
    );

    if (invalidAttrs.length > 0) {
      Modal.error({
        title: 'Datos incompletos',
        content: 'Todos los atributos deben tener nombre, etiqueta y al menos una opción.',
      });
      return;
    }

    const payload: Omit<CreateProductAttributeRequest, 'productId'>[] = currentAttrs.map(
      (attr, index) => ({
        name: attr.name.trim(),
        displayName: attr.displayName.trim(),
        options: attr.options,
        position: index,
      })
    );

    try {
      await saveMutation.mutateAsync({ productId, attributes: payload });
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
          <Text strong>Atributos de Variantes</Text>
          <br />
          <Text type="secondary">
            Define los atributos que diferencian las variantes (color, tamaño, almacenamiento, etc.)
          </Text>
        </div>
        <Space>
          <Button icon={<IconPlus size={16} />} onClick={handleAddAttribute}>
            Agregar Atributo
          </Button>
          <Button
            type="primary"
            icon={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            disabled={!hasChanges}
            loading={saveMutation.isPending}
          >
            Guardar
          </Button>
        </Space>
      </div>

      {displayAttributes.length === 0 ? (
        <Empty
          description="No hay atributos definidos para las variantes"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<IconPlus size={16} />} onClick={handleAddAttribute}>
            Agregar primer atributo
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayAttributes.map((attr, attrIndex) => (
            <Card
              key={attrIndex}
              size="small"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {attr.displayName || `Atributo ${attrIndex + 1}`}
                  </Title>
                  {attr.name && (
                    <Tag color="blue">{attr.name}</Tag>
                  )}
                </div>
              }
              extra={
                <Button
                  type="text"
                  danger
                  icon={<IconTrash size={16} />}
                  onClick={() => handleRemoveAttribute(attrIndex)}
                />
              }
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Etiqueta (visible al usuario)</Text>
                  <Input
                    placeholder="Ej: Color, Almacenamiento, Talla"
                    value={attr.displayName}
                    onChange={(e) => handleAttributeChange(attrIndex, 'displayName', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nombre interno (sin espacios)</Text>
                  <Input
                    placeholder="Ej: color, storage, size"
                    value={attr.name}
                    onChange={(e) => handleAttributeChange(attrIndex, 'name', e.target.value)}
                  />
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Opciones disponibles</Text>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  {attr.options.length === 0 ? (
                    <Text type="secondary" italic>Sin opciones definidas</Text>
                  ) : (
                    <Space wrap>
                      {attr.options.map((option, optIndex) => (
                        <Tag
                          key={optIndex}
                          closable
                          onClose={() => handleRemoveOption(attrIndex, optIndex)}
                          closeIcon={<IconX size={12} />}
                        >
                          {option}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </div>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Nueva opción (ej: Negro, 256GB, L)"
                    value={newOption[attrIndex] || ''}
                    onChange={(e) => setNewOption({ ...newOption, [attrIndex]: e.target.value })}
                    onPressEnter={() => handleAddOption(attrIndex)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    icon={<IconPlus size={16} />}
                    onClick={() => handleAddOption(attrIndex)}
                  >
                    Agregar
                  </Button>
                </Space.Compact>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
