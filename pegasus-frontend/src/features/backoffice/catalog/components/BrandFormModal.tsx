import { useEffect, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { generateSlug } from '../api/brandsApi';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from '@types';

interface BrandFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateBrandRequest | UpdateBrandRequest) => void;
  initialValues?: BrandResponse;
  loading?: boolean;
}

export const BrandFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: BrandFormModalProps) => {
  const [form] = Form.useForm();
  const [slugModifiedManually, setSlugModifiedManually] = useState(false);
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      setSlugModifiedManually(false);
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          slug: initialValues.slug,
          imageUrl: initialValues.imageUrl,
        });
        setSlugModifiedManually(true); // En modo edición, no auto-generar
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
    setSlugModifiedManually(false);
    onCancel();
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    
    // Solo auto-generar si no está editando y el usuario no ha modificado el slug manualmente
    if (!isEdit && !slugModifiedManually && name.trim()) {
      try {
        const slug = await generateSlug(name);
        form.setFieldsValue({ slug });
      } catch (error) {
        console.error('Error generating slug:', error);
      }
    }
  };

  const handleSlugChange = () => {
    // Marcar que el usuario modificó el slug manualmente
    setSlugModifiedManually(true);
  };

  return (
    <Modal
      title={isEdit ? 'Editar Marca' : 'Nueva Marca'}
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
          <Input 
            placeholder="Ingrese el nombre de la marca" 
            onChange={handleNameChange}
          />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'El slug es requerido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^[a-z0-9-]+$/, message: 'Solo letras minúsculas, números y guiones' },
          ]}
          tooltip="URL amigable (ejemplo: nike, adidas). Se genera automáticamente al escribir el nombre"
        >
          <Input 
            placeholder="Ingrese el slug (ej: nike)" 
            onChange={handleSlugChange}
          />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="URL de Imagen (Opcional)"
          rules={[
            { type: 'url', message: 'Debe ser una URL válida' },
          ]}
        >
          <Input placeholder="https://ejemplo.com/logo.png" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
