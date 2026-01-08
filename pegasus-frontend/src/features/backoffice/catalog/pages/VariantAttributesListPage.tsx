import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Select,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconDotsVertical,
} from '@tabler/icons-react';
import {
  useVariantAttributes,
  useCreateVariantAttribute,
  useUpdateVariantAttribute,
  useDeleteVariantAttribute,
} from '../hooks/useVariantAttributes';
import { useDebounce } from '@shared/hooks/useDebounce';
import type {
  VariantAttributeResponse,
  CreateVariantAttributeRequest,
  UpdateVariantAttributeRequest,
  AttributeType,
} from '@types';

const { Title, Text } = Typography;

const ATTRIBUTE_TYPE_OPTIONS: { label: string; value: AttributeType }[] = [
  { label: 'Texto', value: 'TEXT' },
  { label: 'Color', value: 'COLOR' },
  { label: 'Talla', value: 'SIZE' },
  { label: 'Número', value: 'NUMBER' },
];

const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  TEXT: 'Texto',
  COLOR: 'Color',
  SIZE: 'Talla',
  NUMBER: 'Número',
};

const ATTRIBUTE_TYPE_COLORS: Record<AttributeType, string> = {
  TEXT: 'blue',
  COLOR: 'magenta',
  SIZE: 'cyan',
  NUMBER: 'green',
};

export const VariantAttributesListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<VariantAttributeResponse | undefined>();
  const [form] = Form.useForm();

  const { data, isLoading } = useVariantAttributes(page, pageSize, debouncedSearch);
  const createMutation = useCreateVariantAttribute();
  const updateMutation = useUpdateVariantAttribute();
  const deleteMutation = useDeleteVariantAttribute();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleOpenModal = (attribute?: VariantAttributeResponse) => {
    setEditingAttribute(attribute);
    if (attribute) {
      form.setFieldsValue({
        name: attribute.name,
        displayName: attribute.displayName,
        attributeType: attribute.attributeType,
        options: attribute.options.join(', '),
        description: attribute.description,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        attributeType: 'TEXT',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAttribute(undefined);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const options = values.options
        .split(',')
        .map((o: string) => o.trim())
        .filter(Boolean);

      if (editingAttribute) {
        const request: UpdateVariantAttributeRequest = {
          name: values.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: values.displayName,
          attributeType: values.attributeType,
          options,
          description: values.description,
        };
        updateMutation.mutate(
          { id: editingAttribute.id, data: request },
          { onSuccess: handleCloseModal }
        );
      } else {
        const request: CreateVariantAttributeRequest = {
          name: values.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: values.displayName,
          attributeType: values.attributeType,
          options,
          description: values.description,
        };
        createMutation.mutate(request, { onSuccess: handleCloseModal });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Nombre Interno',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => <code style={{ fontSize: 12 }}>{name}</code>,
    },
    {
      title: 'Etiqueta',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
    },
    {
      title: 'Tipo',
      dataIndex: 'attributeType',
      key: 'attributeType',
      width: 100,
      render: (type: AttributeType) => (
        <Tag color={ATTRIBUTE_TYPE_COLORS[type]}>{ATTRIBUTE_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Opciones',
      dataIndex: 'options',
      key: 'options',
      ellipsis: true,
      render: (options: string[]) => (
        <Space size={[8, 8]} wrap>
          {options.slice(0, 5).map((opt) => (
            <Tag key={opt}>{opt}</Tag>
          ))}
          {options.length > 5 && <Tag>+{options.length - 5} más</Tag>}
        </Space>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: VariantAttributeResponse) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Editar',
            icon: <IconEdit size={16} />,
            onClick: () => handleOpenModal(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '¿Eliminar este atributo?',
                content: 'Los productos que lo usen mantendrán los valores actuales.',
                okText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                okButtonProps: { danger: true },
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<IconDotsVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Atributos de Variantes
        </Title>
        <Text type="secondary">
          Catálogo global de atributos para variantes de productos (color, talla, almacenamiento, etc.)
        </Text>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          prefix={<IconSearch size={16} />}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" icon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Nuevo Atributo
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} atributos`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <Modal
        title={editingAttribute ? 'Editar Atributo' : 'Nuevo Atributo'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingAttribute ? 'Actualizar' : 'Crear'}
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
            <Input placeholder="Ej: Color, Talla, Almacenamiento" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nombre interno"
            rules={[
              { required: true, message: 'El nombre interno es requerido' },
              { pattern: /^[a-z_]+$/, message: 'Solo minúsculas y guiones bajos' },
            ]}
            tooltip="Se usará para identificar el atributo en el sistema"
          >
            <Input placeholder="Ej: color, size, storage" />
          </Form.Item>

          <Form.Item
            name="attributeType"
            label="Tipo de atributo"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select options={ATTRIBUTE_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="options"
            label="Opciones (separadas por coma)"
            rules={[{ required: true, message: 'Las opciones son requeridas' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ej: Negro, Blanco, Azul, Rojo"
            />
          </Form.Item>

          <Form.Item name="description" label="Descripción (opcional)">
            <Input.TextArea
              rows={2}
              placeholder="Descripción interna del atributo"
              maxLength={255}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
