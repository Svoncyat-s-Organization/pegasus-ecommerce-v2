import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useRootCategories } from '../hooks/useCategories';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@types';

const { TextArea } = Input;

interface CategoryFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateCategoryRequest | UpdateCategoryRequest) => void;
  initialValues?: CategoryResponse;
  loading?: boolean;
}

export const CategoryFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: CategoryFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;
  const { data: rootCategories, isLoading: loadingCategories } = useRootCategories();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          slug: initialValues.slug,
          description: initialValues.description,
          parentId: initialValues.parentId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Filtrar la categoría actual si estamos editando (no puede ser padre de sí misma)
  const availableParentCategories = isEdit
    ? rootCategories?.filter((cat) => cat.id !== initialValues?.id)
    : rootCategories;

  return (
    <Modal
      title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEdit ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { max: 100, message: 'Máximo 100 caracteres' },
          ]}
        >
          <Input placeholder="Ingrese el nombre de la categoría" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'El slug es requerido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^[a-z0-9-]+$/, message: 'Solo letras minúsculas, números y guiones' },
          ]}
          tooltip="URL amigable (ejemplo: electronica, ropa-hombre)"
        >
          <Input placeholder="Ingrese el slug (ej: electronica)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción"
        >
          <TextArea
            rows={3}
            placeholder="Descripción opcional de la categoría"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Categoría Padre"
          tooltip="Dejar vacío para crear una categoría raíz"
        >
          <Select
            placeholder="Seleccione categoría padre (opcional)"
            allowClear
            loading={loadingCategories}
            options={availableParentCategories?.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
