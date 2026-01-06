import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Spin, Alert, Select, Typography, Divider } from 'antd';
import { IconDeviceFloppy, IconBuildingStore, IconWorld, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandTiktok } from '@tabler/icons-react';
import { useBusinessInfo, useUpdateBusinessInfo } from '../hooks/useSettings';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import type { UpdateBusinessInfoRequest } from '@types';
import { formatDateTime } from '@shared/utils/formatters';

const { TextArea } = Input;
const { Text } = Typography;

export const BusinessInfoForm = () => {
  const [form] = Form.useForm<UpdateBusinessInfoRequest>();
  const { data, isLoading, error } = useBusinessInfo();
  const updateMutation = useUpdateBusinessInfo();

  // Ubigeo state
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  // Initialize form when data loads
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        businessName: data.businessName,
        ruc: data.ruc,
        legalAddress: data.legalAddress,
        ubigeoId: data.ubigeoId,
        phone: data.phone,
        email: data.email,
        website: data.website || '',
        logoUrl: data.logoUrl || '',
        businessDescription: data.businessDescription || '',
        facebookUrl: data.facebookUrl || '',
        instagramUrl: data.instagramUrl || '',
        twitterUrl: data.twitterUrl || '',
        tiktokUrl: data.tiktokUrl || '',
      });

      // Set ubigeo selectors
      if (data.ubigeoId && data.ubigeoId.length === 6) {
        setSelectedDepartment(data.ubigeoId.substring(0, 2));
        setSelectedProvince(data.ubigeoId.substring(0, 4));
      }
    }
  }, [data, form]);

  const handleSubmit = async (values: UpdateBusinessInfoRequest) => {
    await updateMutation.mutateAsync(values);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedProvince(undefined);
    form.setFieldsValue({ ubigeoId: undefined });
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    form.setFieldsValue({ ubigeoId: undefined });
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" tip="Cargando información..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Error al cargar la información"
        description={(error as Error).message}
        showIcon
      />
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={data}
    >
      {/* Basic Info */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBuildingStore size={20} />
            Información General
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              label="Nombre de la Empresa"
              name="businessName"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Pegasus E-commerce S.A.C." maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="RUC"
              name="ruc"
              rules={[
                { required: true, message: 'El RUC es requerido' },
                { pattern: /^(10|20)\d{9}$/, message: 'RUC inválido (11 dígitos, inicia con 10 o 20)' },
              ]}
            >
              <Input placeholder="20123456789" maxLength={11} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[
                { required: true, message: 'El teléfono es requerido' },
                { pattern: /^9\d{8}$/, message: 'Debe ser 9 dígitos e iniciar con 9' },
              ]}
            >
              <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Correo Electrónico"
              name="email"
              rules={[
                { required: true, message: 'El correo es requerido' },
                { type: 'email', message: 'Formato de correo inválido' },
              ]}
            >
              <Input placeholder="contacto@pegasus.pe" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Descripción del Negocio"
          name="businessDescription"
        >
          <TextArea
            rows={3}
            placeholder="Descripción breve de la empresa y sus actividades..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Card>

      {/* Legal Address */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWorld size={20} />
            Dirección Legal
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Departamento" required>
              <Select
                placeholder="Seleccionar departamento"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                options={departments?.map((d) => ({ label: d.name, value: d.id }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Provincia" required>
              <Select
                placeholder="Seleccionar provincia"
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!selectedDepartment}
                options={provinces?.map((p) => ({ label: p.name, value: p.id }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Distrito"
              name="ubigeoId"
              rules={[{ required: true, message: 'El distrito es requerido' }]}
            >
              <Select
                placeholder="Seleccionar distrito"
                disabled={!selectedProvince}
                options={districts?.map((d) => ({ label: d.name, value: d.id }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Dirección Legal Completa"
          name="legalAddress"
          rules={[{ required: true, message: 'La dirección es requerida' }]}
        >
          <TextArea
            rows={2}
            placeholder="Av. Principal 123, Oficina 456"
          />
        </Form.Item>
      </Card>

      {/* Web & Social Media */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWorld size={20} />
            Web y Redes Sociales
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Sitio Web"
              name="website"
            >
              <Input placeholder="https://www.pegasus.pe" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="URL del Logo"
              name="logoUrl"
            >
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Redes Sociales</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBrandFacebook size={16} />
                  Facebook
                </span>
              }
              name="facebookUrl"
            >
              <Input placeholder="https://facebook.com/pegasus" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBrandInstagram size={16} />
                  Instagram
                </span>
              }
              name="instagramUrl"
            >
              <Input placeholder="https://instagram.com/pegasus" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBrandTwitter size={16} />
                  Twitter / X
                </span>
              }
              name="twitterUrl"
            >
              <Input placeholder="https://twitter.com/pegasus" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBrandTiktok size={16} />
                  TikTok
                </span>
              }
              name="tiktokUrl"
            >
              <Input placeholder="https://tiktok.com/@pegasus" />
            </Form.Item>
          </Col>
        </Row>
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
