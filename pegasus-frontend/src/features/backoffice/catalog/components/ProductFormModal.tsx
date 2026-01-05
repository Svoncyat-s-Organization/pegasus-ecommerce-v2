import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@types';

const { TextArea } = Input;

interface ProductFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductRequest | UpdateProductRequest) => void;
  initialValues?: ProductResponse;
  loading?: boolean;
}

export const ProductFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: ProductFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;
  
  const { data: brandsData, isLoading: loadingBrands } = useBrands(0, 100);
  const { data: categoriesData, isLoading: loadingCategories } = useCategories(0, 100);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          slug: initialValues.slug,
          code: initialValues.code,
          description: initialValues.description,
          brandId: initialValues.brandId,
          categoryId: initialValues.categoryId,
          isFeatured: initialValues.isFeatured,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Convertir specs a objeto vacío si no hay datos
      const formattedValues = {
        ...values,
        specs: {},
      };
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEdit ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{
          isFeatured: false,
        }}
      >
        <Form.Item
          name="name"
          label="Nombre del Producto"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { max: 200, message: 'Máximo 200 caracteres' },
          ]}
        >
          <Input placeholder="Ingrese el nombre del producto" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'El slug es requerido' },
            { max: 200, message: 'Máximo 200 caracteres' },
            { pattern: /^[a-z0-9-]+$/, message: 'Solo letras minúsculas, números y guiones' },
          ]}
          tooltip="URL amigable (ejemplo: laptop-hp-15)"
        >
          <Input placeholder="Ingrese el slug (ej: laptop-hp-15)" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Código"
          rules={[
            { required: true, message: 'El código es requerido' },
            { max: 50, message: 'Máximo 50 caracteres' },
          ]}
        >
          <Input placeholder="Código único del producto (ej: PROD-001)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción"
        >
          <TextArea
            rows={4}
            placeholder="Descripción del producto"
          />
        </Form.Item>

        <Form.Item
          name="brandId"
          label="Marca"
          rules={[{ required: true, message: 'La marca es requerida' }]}
        >
          <Select
            placeholder="Seleccione una marca"
            loading={loadingBrands}
            showSearch
            optionFilterProp="label"
            options={brandsData?.content?.map((brand) => ({
              label: brand.name,
              value: brand.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Categoría"
          rules={[{ required: true, message: 'La categoría es requerida' }]}
        >
          <Select
            placeholder="Seleccione una categoría"
            loading={loadingCategories}
            showSearch
            optionFilterProp="label"
            options={categoriesData?.content?.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="isFeatured"
          label="Producto Destacado"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
