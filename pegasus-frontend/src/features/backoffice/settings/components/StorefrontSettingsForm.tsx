import { useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Spin, Alert, ColorPicker, Typography, Divider, Tabs } from 'antd';
import { IconDeviceFloppy, IconPalette, IconFileText, IconHeadset, IconBrandWhatsapp } from '@tabler/icons-react';
import { useStorefrontSettings, useUpdateStorefrontSettings } from '../hooks/useSettings';
import type { UpdateStorefrontSettingsRequest } from '@types';
import { formatDateTime } from '@shared/utils/formatters';
import type { Color } from 'antd/es/color-picker';

const { TextArea } = Input;
const { Text } = Typography;

export const StorefrontSettingsForm = () => {
  const [form] = Form.useForm<UpdateStorefrontSettingsRequest>();
  const { data, isLoading, error } = useStorefrontSettings();
  const updateMutation = useUpdateStorefrontSettings();

  // Initialize form when data loads
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        storefrontName: data.storefrontName,
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        termsAndConditions: data.termsAndConditions || '',
        privacyPolicy: data.privacyPolicy || '',
        returnPolicy: data.returnPolicy || '',
        shippingPolicy: data.shippingPolicy || '',
        supportEmail: data.supportEmail || '',
        supportPhone: data.supportPhone || '',
        whatsappNumber: data.whatsappNumber || '',
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: UpdateStorefrontSettingsRequest) => {
    // Ensure colors are strings (ColorPicker may return Color objects)
    const submitValues = {
      ...values,
      primaryColor: typeof values.primaryColor === 'string' 
        ? values.primaryColor 
        : (values.primaryColor as unknown as Color).toHexString(),
      secondaryColor: typeof values.secondaryColor === 'string'
        ? values.secondaryColor
        : (values.secondaryColor as unknown as Color).toHexString(),
    };
    await updateMutation.mutateAsync(submitValues);
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" tip="Cargando configuración..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Error al cargar la configuración"
        description={(error as Error).message}
        showIcon
      />
    );
  }

  const policyTabItems = [
    {
      key: 'terms',
      label: 'Términos y Condiciones',
      children: (
        <Form.Item name="termsAndConditions">
          <TextArea
            rows={12}
            placeholder="Ingrese los términos y condiciones de uso de la tienda..."
            showCount
          />
        </Form.Item>
      ),
    },
    {
      key: 'privacy',
      label: 'Política de Privacidad',
      children: (
        <Form.Item name="privacyPolicy">
          <TextArea
            rows={12}
            placeholder="Ingrese la política de privacidad y tratamiento de datos..."
            showCount
          />
        </Form.Item>
      ),
    },
    {
      key: 'returns',
      label: 'Política de Devoluciones',
      children: (
        <Form.Item name="returnPolicy">
          <TextArea
            rows={12}
            placeholder="Ingrese la política de devoluciones y reembolsos..."
            showCount
          />
        </Form.Item>
      ),
    },
    {
      key: 'shipping',
      label: 'Política de Envíos',
      children: (
        <Form.Item name="shippingPolicy">
          <TextArea
            rows={12}
            placeholder="Ingrese la política de envíos, tiempos y costos..."
            showCount
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={data}
    >
      {/* Branding */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconPalette size={20} />
            Marca y Apariencia
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nombre de la Tienda"
              name="storefrontName"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Pegasus Store" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="URL del Logo"
              name="logoUrl"
              extra="Logo principal que se mostrará en el header"
            >
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="URL del Favicon"
              name="faviconUrl"
              extra="Icono pequeño que aparece en la pestaña del navegador"
            >
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Colores del Tema</Divider>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Color Primario"
              name="primaryColor"
              rules={[{ required: true, message: 'El color primario es requerido' }]}
              getValueFromEvent={(color: Color) => color.toHexString()}
            >
              <ColorPicker
                showText
                format="hex"
                presets={[
                  {
                    label: 'Recomendados',
                    colors: [
                      '#04213b', '#1890ff', '#52c41a', '#722ed1',
                      '#eb2f96', '#fa8c16', '#13c2c2', '#2f54eb',
                    ],
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Color Secundario"
              name="secondaryColor"
              rules={[{ required: true, message: 'El color secundario es requerido' }]}
              getValueFromEvent={(color: Color) => color.toHexString()}
            >
              <ColorPicker
                showText
                format="hex"
                presets={[
                  {
                    label: 'Recomendados',
                    colors: [
                      '#f2f2f2', '#f5f5f5', '#fafafa', '#e6f7ff',
                      '#f6ffed', '#f9f0ff', '#fff0f6', '#fff7e6',
                    ],
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Color Preview */}
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            Vista previa:
          </Text>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div
              style={{
                width: 120,
                height: 40,
                backgroundColor: form.getFieldValue('primaryColor') || data?.primaryColor || '#04213b',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              Primario
            </div>
            <div
              style={{
                width: 120,
                height: 40,
                backgroundColor: form.getFieldValue('secondaryColor') || data?.secondaryColor || '#f2f2f2',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
                fontWeight: 500,
                border: '1px solid #d9d9d9',
              }}
            >
              Secundario
            </div>
          </div>
        </div>
      </Card>

      {/* Support Contact */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconHeadset size={20} />
            Contacto de Soporte
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Email de Soporte"
              name="supportEmail"
              rules={[{ type: 'email', message: 'Formato de correo inválido' }]}
            >
              <Input placeholder="soporte@pegasus.pe" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Teléfono de Soporte"
              name="supportPhone"
              rules={[
                { pattern: /^9\d{8}$/, message: 'Debe ser 9 dígitos e iniciar con 9' },
              ]}
            >
              <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBrandWhatsapp size={16} />
                  WhatsApp
                </span>
              }
              name="whatsappNumber"
              rules={[
                { pattern: /^9\d{8}$/, message: 'Debe ser 9 dígitos e iniciar con 9' },
              ]}
            >
              <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Legal Policies */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconFileText size={20} />
            Documentos Legales
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          Estas políticas se mostrarán en el footer del storefront y son requeridas para cumplir con la normativa de comercio electrónico.
        </Text>
        <Tabs items={policyTabItems} />
      </Card>

      {/* Footer */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            Última actualización: {data?.updatedAt ? formatDateTime(data.updatedAt) : '-'}
          </Text>
          <Button
            type="primary"
            htmlType="submit"
            icon={<IconDeviceFloppy size={18} />}
            loading={updateMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </div>
      </Card>
    </Form>
  );
};
