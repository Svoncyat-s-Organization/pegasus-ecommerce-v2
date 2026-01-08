import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Tabs,
  Row,
  Col,
  Typography,
  message,
  Alert,
  theme,
  Space,
  Divider,
} from 'antd';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPackage,
  IconStack2,
} from '@tabler/icons-react';
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import type { CreateProductRequest, UpdateProductRequest } from '@types';
import {
  CategoryBasedSpecsEditor,
  ProductImagesGallery,
  ProductVariantAttributesEditor,
  VariantsList,
} from '../components/product-form';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ProductFormPage = () => {
  const { token } = theme.useToken();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEdit = !!id;
  const productId = id ? parseInt(id, 10) : undefined;

  const [activeTab, setActiveTab] = useState('product');

  // Queries
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || 0);
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

  // Auto-generar slug desde el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const currentSlug = form.getFieldValue('slug');

    // Solo auto-generar si el slug está vacío o no ha sido modificado manualmente
    if (!currentSlug || currentSlug === generateSlug(form.getFieldValue('name') || '')) {
      form.setFieldValue('slug', generateSlug(name));
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (values: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (isEdit && productId) {
        await updateMutation.mutateAsync({ id: productId, request: values as UpdateProductRequest });
        message.success('Producto actualizado exitosamente');
      } else {
        const result = await createMutation.mutateAsync(values as CreateProductRequest);
        message.success('Producto creado exitosamente');
        // Redirigir a la edición para completar specs, imágenes y variantes
        navigate(`/admin/catalog/products/${result.id}/edit`);
        return;
      }
    } catch {
      // Error ya manejado por el hook
    }
  };

  const handleCancel = () => {
    navigate('/admin/catalog/products');
  };

  // ============================================
  // TAB: PRODUCTO
  // ============================================
  const ProductTabContent = (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={[24, 24]}>
        {/* Columna Principal */}
        <Col xs={24} lg={16}>
          {/* Información Básica */}
          <Card
            title={<Text strong>Información Básica</Text>}
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  label="Nombre del Producto"
                  name="name"
                  rules={[
                    { required: true, message: 'El nombre es requerido' },
                    { max: 255, message: 'Máximo 255 caracteres' },
                  ]}
                >
                  <Input
                    placeholder="iPhone 15 Pro Max 256GB"
                    size="large"
                    onChange={handleNameChange}
                    showCount
                    maxLength={255}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Código Interno"
                  name="code"
                  rules={[
                    { required: true, message: 'El código es requerido' },
                    { max: 50, message: 'Máximo 50 caracteres' },
                  ]}
                >
                  <Input placeholder="IPH15PRO" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="URL Amigable"
                  name="slug"
                  rules={[
                    { required: true, message: 'El slug es requerido' },
                    { pattern: /^[a-z0-9-]+$/, message: 'Solo minúsculas, números y guiones' },
                  ]}
                >
                  <Input placeholder="iphone-15-pro-max-256gb" addonBefore="/" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Descripción" name="description">
                  <TextArea
                    rows={4}
                    placeholder="Describe las características principales del producto..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Especificaciones */}
          {isEdit && productId && (
            <Card title={<Text strong>Especificaciones Técnicas</Text>} style={{ marginBottom: 24 }}>
              <CategoryBasedSpecsEditor
                productId={productId}
                categoryId={product?.categoryId}
                initialSpecs={product?.specs}
              />
            </Card>
          )}

          {/* Imágenes */}
          {isEdit && productId && (
            <Card title={<Text strong>Galería de Imágenes</Text>}>
              <ProductImagesGallery productId={productId} />
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Clasificación */}
          <Card title={<Text strong>Clasificación</Text>} style={{ marginBottom: 24 }}>
            <Form.Item
              label="Marca"
              name="brandId"
              rules={[{ required: true, message: 'Selecciona una marca' }]}
            >
              <Select
                placeholder="Seleccionar"
                size="large"
                options={brandsData?.content.map((brand) => ({
                  label: brand.name,
                  value: brand.id,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              label="Categoría"
              name="categoryId"
              rules={[{ required: true, message: 'Selecciona una categoría' }]}
            >
              <Select
                placeholder="Seleccionar"
                size="large"
                options={categoriesData?.content.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Card>

          {/* Visibilidad */}
          <Card title={<Text strong>Visibilidad</Text>}>
            <Form.Item
              label="Producto Destacado"
              name="isFeatured"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              Aparecerá en la página principal
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Row justify="end" style={{ marginTop: 24 }}>
        <Space size="middle">
          <Button onClick={handleCancel} size="large">
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<IconDeviceFloppy size={18} />}
            loading={createMutation.isPending || updateMutation.isPending}
            size="large"
          >
            {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </Space>
      </Row>

      {!isEdit && (
        <Alert
          type="info"
          showIcon
          message="Después de crear el producto podrás agregar especificaciones, imágenes y variantes"
          style={{ marginTop: 16 }}
        />
      )}
    </Form>
  );

  // ============================================
  // TAB: VARIANTES
  // ============================================
  const VariantsTabContent = (
    <div>
      {!isEdit || !productId ? (
        <Alert
          type="warning"
          showIcon
          message="Guarda el producto primero"
          description="Para configurar variantes, primero debes crear y guardar el producto."
        />
      ) : (
        <>
          {/* Definición de Atributos */}
          <div style={{ marginBottom: 32 }}>
            <Title level={5} style={{ marginBottom: 8, color: token.colorText }}>
              Atributos de Variantes
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Selecciona los atributos del catálogo global que aplican a este producto. Puedes
              personalizar las opciones para cada atributo.
            </Text>
            <ProductVariantAttributesEditor productId={productId} />
          </div>

          <Divider />

          {/* Lista de Variantes */}
          <div>
            <Title level={5} style={{ marginBottom: 8, color: token.colorText }}>
              Variantes del Producto
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Cada variante representa una combinación única de atributos con su propio SKU, precio e
              imágenes.
            </Text>
            <VariantsList productId={productId} />
          </div>
        </>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'product',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPackage size={18} />
          Producto
        </span>
      ),
      children: ProductTabContent,
    },
    {
      key: 'variants',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconStack2 size={18} />
          Variantes
        </span>
      ),
      children: VariantsTabContent,
      disabled: !isEdit,
    },
  ];

  if (isLoadingProduct && isEdit) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>Cargando producto...</div>
      </Card>
    );
  }

  return (
    <Card styles={{ body: { padding: '24px 32px' } }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={<IconArrowLeft size={20} />}
          onClick={handleCancel}
          style={{ padding: 4 }}
        />
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </Title>
          {isEdit && product && (
            <Text type="secondary">
              {product.name} · {product.code}
            </Text>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" />
    </Card>
  );
};
