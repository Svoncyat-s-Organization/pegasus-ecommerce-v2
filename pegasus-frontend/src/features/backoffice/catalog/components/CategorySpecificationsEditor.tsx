import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Input,
  Select,
  Switch,
  Popconfirm,
  Form,
  Modal,
  Empty,
  Tag,
  theme,
} from 'antd';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconGripVertical,
} from '@tabler/icons-react';
import type {
  SaveCategorySpecificationRequest,
  SpecType,
} from '@types';
import {
  useCategorySpecifications,
  useSaveAllCategorySpecifications,
} from '../hooks/useCategorySpecifications';

const { useToken } = theme;

interface CategorySpecificationsEditorProps {
  categoryId: number;
  categoryName: string;
  onClose: () => void;
}

const SPEC_TYPE_OPTIONS: { label: string; value: SpecType }[] = [
  { label: 'Texto', value: 'TEXT' },
  { label: 'Número', value: 'NUMBER' },
  { label: 'Selección', value: 'SELECT' },
  { label: 'Sí/No', value: 'BOOLEAN' },
];

const SPEC_TYPE_LABELS: Record<SpecType, string> = {
  TEXT: 'Texto',
  NUMBER: 'Número',
  SELECT: 'Selección',
  BOOLEAN: 'Sí/No',
};

const SPEC_TYPE_COLORS: Record<SpecType, string> = {
  TEXT: 'blue',
  NUMBER: 'green',
  SELECT: 'purple',
  BOOLEAN: 'orange',
};

export const CategorySpecificationsEditor = ({
  categoryId,
  categoryName,
  onClose,
}: CategorySpecificationsEditorProps) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<SaveCategorySpecificationRequest | null>(null);
  const [localSpecs, setLocalSpecs] = useState<SaveCategorySpecificationRequest[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: specifications, isLoading } = useCategorySpecifications(categoryId);
  const saveAllMutation = useSaveAllCategorySpecifications();

  // Initialize local state from server data
  useEffect(() => {
    if (specifications) {
      const mapped = specifications.map((spec) => ({
        id: spec.id,
        name: spec.name,
        displayName: spec.displayName,
        specType: spec.specType,
        unit: spec.unit,
        options: spec.options,
        isRequired: spec.isRequired,
        position: spec.position,
      }));
      setLocalSpecs(mapped);
      setHasChanges(false);
    }
  }, [specifications]);

  const handleAddSpec = () => {
    setEditingSpec(null);
    form.resetFields();
    form.setFieldsValue({
      specType: 'TEXT',
      isRequired: false,
    });
    setEditModalOpen(true);
  };

  const handleEditSpec = (spec: SaveCategorySpecificationRequest, index: number) => {
    setEditingSpec({ ...spec, position: index });
    form.setFieldsValue({
      name: spec.name,
      displayName: spec.displayName,
      specType: spec.specType,
      unit: spec.unit,
      options: spec.options?.join(', '),
      isRequired: spec.isRequired,
    });
    setEditModalOpen(true);
  };

  const handleDeleteSpec = (index: number) => {
    const newSpecs = localSpecs.filter((_, i) => i !== index);
    setLocalSpecs(newSpecs);
    setHasChanges(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const newSpec: SaveCategorySpecificationRequest = {
        id: editingSpec?.id,
        name: values.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: values.displayName,
        specType: values.specType,
        unit: values.unit || undefined,
        options: values.specType === 'SELECT' && values.options
          ? values.options.split(',').map((o: string) => o.trim()).filter(Boolean)
          : undefined,
        isRequired: values.isRequired || false,
        position: editingSpec?.position ?? localSpecs.length,
      };

      if (editingSpec?.id) {
        // Update existing
        const newSpecs = localSpecs.map((spec, index) =>
          index === editingSpec.position ? newSpec : spec
        );
        setLocalSpecs(newSpecs);
      } else {
        // Add new
        setLocalSpecs([...localSpecs, newSpec]);
      }
      
      setHasChanges(true);
      setEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSave = async () => {
    const dataToSave = localSpecs.map((spec, index) => ({
      ...spec,
      position: index,
    }));
    
    await saveAllMutation.mutateAsync({
      categoryId,
      data: dataToSave,
    });
    
    setHasChanges(false);
  };

  const specType = Form.useWatch('specType', form);

  const columns = [
    {
      title: '',
      dataIndex: 'drag',
      width: 40,
      render: () => (
        <IconGripVertical
          size={16}
          style={{ cursor: 'grab', color: token.colorTextTertiary }}
        />
      ),
    },
    {
      title: 'Nombre Interno',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <code style={{ fontSize: 12, color: token.colorTextSecondary }}>{name}</code>
      ),
    },
    {
      title: 'Etiqueta',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Tipo',
      dataIndex: 'specType',
      key: 'specType',
      width: 100,
      render: (type: SpecType) => (
        <Tag color={SPEC_TYPE_COLORS[type]}>{SPEC_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (unit: string) => unit || '-',
    },
    {
      title: 'Requerido',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 90,
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? 'Sí' : 'No'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: SaveCategorySpecificationRequest, index: number) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEditSpec(record, index)}
          />
          <Popconfirm
            title="¿Eliminar esta especificación?"
            onConfirm={() => handleDeleteSpec(index)}
            okText="Eliminar"
            cancelText="Cancelar"
          >
            <Button type="text" size="small" danger icon={<IconTrash size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={`Especificaciones: ${categoryName}`}
        extra={
          <Space>
            {hasChanges && (
              <Tag color="warning">Cambios sin guardar</Tag>
            )}
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saveAllMutation.isPending}
              disabled={!hasChanges}
            >
              Guardar
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="dashed"
            icon={<IconPlus size={16} />}
            onClick={handleAddSpec}
            style={{ width: '100%' }}
          >
            Agregar Especificación
          </Button>

          {localSpecs.length > 0 ? (
            <Table
              dataSource={localSpecs}
              columns={columns}
              rowKey={(record, index) => record.id?.toString() || `new-${index}`}
              pagination={false}
              size="small"
              loading={isLoading}
            />
          ) : (
            <Empty
              description="No hay especificaciones definidas para esta categoría"
              style={{ padding: '40px 0' }}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={editingSpec?.id ? 'Editar Especificación' : 'Nueva Especificación'}
        open={editModalOpen}
        onOk={handleModalOk}
        onCancel={() => setEditModalOpen(false)}
        okText={editingSpec?.id ? 'Actualizar' : 'Agregar'}
        cancelText="Cancelar"
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="displayName"
            label="Etiqueta (visible al usuario)"
            rules={[{ required: true, message: 'La etiqueta es requerida' }]}
          >
            <Input placeholder="Ej: Tamaño de pantalla, Material, Peso" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nombre interno"
            rules={[
              { required: true, message: 'El nombre interno es requerido' },
              { pattern: /^[a-z_]+$/, message: 'Solo minúsculas y guiones bajos' },
            ]}
            tooltip="Se usará para identificar la especificación en el sistema"
          >
            <Input placeholder="Ej: screen_size, material, weight" />
          </Form.Item>

          <Form.Item
            name="specType"
            label="Tipo de dato"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select options={SPEC_TYPE_OPTIONS} />
          </Form.Item>

          {specType === 'NUMBER' && (
            <Form.Item name="unit" label="Unidad de medida">
              <Input placeholder="Ej: kg, cm, mAh, GB" />
            </Form.Item>
          )}

          {specType === 'SELECT' && (
            <Form.Item
              name="options"
              label="Opciones (separadas por coma)"
              rules={[{ required: true, message: 'Las opciones son requeridas para tipo Selección' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Ej: Algodón, Poliéster, Lana"
              />
            </Form.Item>
          )}

          <Form.Item
            name="isRequired"
            label="¿Es requerido?"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
