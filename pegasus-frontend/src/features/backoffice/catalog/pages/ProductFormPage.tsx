import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Switch, Button, Tabs, Row, Col, Typography, Space, message } from 'antd';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import type { CreateProductRequest, UpdateProductRequest } from '@types';
import { VariantsSection } from '../components/VariantsSection';
import { ImagesSection } from '../components/ImagesSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEdit = !!id;
  const productId = id ? parseInt(id, 10) : undefined;

  const [activeTab, setActiveTab] = useState('basic');

  // Queries
  const { data: product } = useProduct(productId || 0);
  const { data: brandsData } = useBrands(0, 100);
  const { data: categoriesData } = useCategories(0, 100);

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // Cargar datos del producto al editar
  useEffect(() => {
    if (isEdit && product) {
      form.setFieldsValue({
        name: product.name,
        slug: product.slug,
        code: product.code,
        description: product.description,
        brandId: product.brandId,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured,
      });
    }
  }, [isEdit, product, form]);

  const handleSubmit = async (values: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (isEdit && productId) {
        await updateMutation.mutateAsync({ id: productId, request: values as UpdateProductRequest });
        message.success('Producto actualizado exitosamente');
        navigate('/admin/catalog/products');
      } else {
        await createMutation.mutateAsync(values as CreateProductRequest);
        message.success('Producto creado exitosamente');
        navigate('/admin/catalog/products');
      }
    } catch {
      // Error ya manejado por el hook
    }
  };

  const handleCancel = () => {
    navigate('/admin/catalog/products');
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Información Básica',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="name"
                rules={[
                  { required: true, message: 'Nombre es requerido' },
                  { max: 255, message: 'Máximo 255 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Laptop Dell Inspiron 15" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Slug"
                name="slug"
                rules={[
                  { required: true, message: 'Slug es requerido' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Solo minúsculas, números y guiones' },
                ]}
              >
                <Input placeholder="laptop-dell-inspiron-15" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Código"
                name="code"
                rules={[
                  { required: true, message: 'Código es requerido' },
                  { max: 50, message: 'Máximo 50 caracteres' },
                ]}
              >
                <Input placeholder="PROD-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Marca"
                name="brandId"
                rules={[{ required: true, message: 'Marca es requerida' }]}
              >
                <Select
                  placeholder="Seleccionar marca"
                  options={brandsData?.content.map((brand) => ({
                    label: brand.name,
                    value: brand.id,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Categoría"
                name="categoryId"
                rules={[{ required: true, message: 'Categoría es requerida' }]}
              >
                <Select
                  placeholder="Seleccionar categoría"
                  options={categoriesData?.content.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Descripción" name="description">
            <TextArea
              rows={4}
              placeholder="Descripción detallada del producto..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item label="Producto Destacado" name="isFeatured" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" icon={<IconDeviceFloppy size={16} />} loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Actualizar' : 'Crear'}
            </Button>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
          </Space>
        </Form>
      ),
    },
    {
      key: 'variants',
      label: 'Variantes',
      disabled: !isEdit,
      children: isEdit && productId ? (
        <VariantsSection productId={productId} />
      ) : (
        <Text type="secondary">Guarda el producto primero para agregar variantes</Text>
      ),
    },
    {
      key: 'images',
      label: 'Imágenes',
      disabled: !isEdit,
      children: isEdit && productId ? (
        <ImagesSection productId={productId} />
      ) : (
        <Text type="secondary">Guarda el producto primero para agregar imágenes</Text>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button type="text" icon={<IconArrowLeft size={20} />} onClick={handleCancel} />
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>
              {isEdit ? 'Editar Producto' : 'Crear Producto'}
            </Title>
            {isEdit && product && (
              <Text type="secondary">{product.name}</Text>
            )}
          </div>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Card>
  );
};
