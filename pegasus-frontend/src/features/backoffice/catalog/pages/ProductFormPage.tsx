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
  Space,
  Divider,
  Spin,
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
import { useCreateImage } from '../hooks/useImages';
import { useSaveAllProductVariantAttributes } from '../hooks/useProductVariantAttributes';
import { useCreateVariant } from '../hooks/useVariants';
import type { 
  CreateProductRequest, 
  UpdateProductRequest,
} from '@types';
import {
  CategoryBasedSpecsEditor,
  ProductImagesGallery,
  ProductVariantAttributesEditor,
  VariantsList,
  type LocalVariantAttribute,
} from '../components/product-form';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Local state types for creation mode
interface LocalImage {
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  variantId?: number;
}

interface LocalVariant {
  sku: string;
  price: number;
  attributes: Record<string, unknown>;
}

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEdit = !!id;
  const productId = id ? parseInt(id, 10) : undefined;

  const [activeTab, setActiveTab] = useState('product');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state for creation mode
  const [localSpecs, setLocalSpecs] = useState<Record<string, string>>({});
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [localVariantAttributes, setLocalVariantAttributes] = useState<LocalVariantAttribute[]>([]);
  const [localVariants, setLocalVariants] = useState<LocalVariant[]>([]);

  // Queries
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || 0, { enabled: isEdit });
  const { data: brandsData } = useBrands(0, 100);
  const { data: categoriesData } = useCategories(0, 100);

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const createImageMutation = useCreateImage();
  const saveVariantAttributesMutation = useSaveAllProductVariantAttributes();
  const createVariantMutation = useCreateVariant();

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
      setIsSubmitting(true);
      
      if (isEdit && productId) {
        // Edit mode: simple update
        await updateMutation.mutateAsync({ id: productId, request: values as UpdateProductRequest });
        message.success('Producto actualizado exitosamente');
      } else {
        // Creation mode: create product with all related data
        message.loading({ content: 'Creando producto...', key: 'create-product', duration: 0 });
        
        // Step 1: Create product
        const createdProduct = await createMutation.mutateAsync(values as CreateProductRequest);
        const newProductId = createdProduct.id;
        
        // Step 2: Save specs (if any)
        if (Object.keys(localSpecs).length > 0) {
          message.loading({ content: 'Guardando especificaciones...', key: 'create-product', duration: 0 });
          await updateMutation.mutateAsync({
            id: newProductId,
            request: { specs: localSpecs as Record<string, unknown> },
          });
        }
        
        // Step 3: Save images (if any)
        if (localImages.length > 0) {
          message.loading({ content: 'Guardando imágenes...', key: 'create-product', duration: 0 });
          for (const image of localImages) {
            await createImageMutation.mutateAsync({
              imageUrl: image.imageUrl,
              productId: newProductId,
              variantId: image.variantId,
              isPrimary: image.isPrimary,
              displayOrder: image.displayOrder,
            });
          }
        }
        
        // Step 4: Save variant attributes (if any)
        if (localVariantAttributes.length > 0) {
          message.loading({ content: 'Guardando atributos de variante...', key: 'create-product', duration: 0 });
          await saveVariantAttributesMutation.mutateAsync({
            productId: newProductId,
            data: localVariantAttributes.map(attr => ({
              variantAttributeId: attr.variantAttributeId,
              customOptions: attr.customOptions,
              position: attr.position,
            })),
          });
        }
        
        // Step 5: Create variants (if any)
        if (localVariants.length > 0) {
          message.loading({ content: 'Creando variantes...', key: 'create-product', duration: 0 });
          for (const variant of localVariants) {
            await createVariantMutation.mutateAsync({
              ...variant,
              productId: newProductId,
            });
          }
        }
        
        message.success({ content: 'Producto creado exitosamente', key: 'create-product', duration: 2 });
        
        // Navigate to edit page to continue working
        navigate(`/admin/catalog/products/${newProductId}/edit`);
        return;
      }
    } catch (error) {
      message.destroy('create-product');
      // Error already handled by hooks
    } finally {
      setIsSubmitting(false);
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
          <Card title={<Text strong>Especificaciones Técnicas</Text>} style={{ marginBottom: 24 }}>
            <CategoryBasedSpecsEditor
              productId={productId}
              categoryId={form.getFieldValue('categoryId') || product?.categoryId}
              initialSpecs={product?.specs}
              localMode={!isEdit}
              onLocalChange={setLocalSpecs}
            />
          </Card>

          {/* Imágenes */}
          <Card title={<Text strong>Galería de Imágenes</Text>}>
            <ProductImagesGallery 
              productId={productId} 
              localMode={!isEdit}
              onLocalChange={setLocalImages}
            />
          </Card>
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
            loading={isSubmitting}
            size="large"
          >
            {isEdit ? 'Guardar Cambios' : 'Crear Producto Completo'}
          </Button>
        </Space>
      </Row>

      {!isEdit && (
        <Alert
          type="info"
          showIcon
          message="Crea el producto con todos sus detalles"
          description="Puedes configurar especificaciones, imágenes y variantes antes de guardar. Todo se creará en una sola operación."
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
      {!form.getFieldValue('categoryId') && !isEdit ? (
        <Alert
          type="warning"
          showIcon
          message="Selecciona una categoría primero"
          description="Para configurar variantes, primero selecciona una categoría en la pestaña Producto."
        />
      ) : (
        <>
          {/* Definición de Atributos */}
          <div style={{ marginBottom: 32 }}>
            <ProductVariantAttributesEditor 
              productId={productId} 
              localMode={!isEdit}
              onLocalChange={setLocalVariantAttributes}
            />
          </div>

          <Divider />

          {/* Lista de Variantes */}
          <div>
            <VariantsList 
              productId={productId} 
              localMode={!isEdit}
              localVariantAttributes={localVariantAttributes}
              onLocalChange={setLocalVariants}
            />
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
    },
  ];

  if (isLoadingProduct && isEdit) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Cargando producto...</Text>
          </div>
        </div>
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
