import { Card, Typography, Tabs } from 'antd';
import { IconSettings, IconBuildingStore, IconShoppingCart } from '@tabler/icons-react';
import { BusinessInfoForm } from '../components/BusinessInfoForm';
import { StorefrontSettingsForm } from '../components/StorefrontSettingsForm';

const { Title, Text } = Typography;

export const SettingsPage = () => {
  const tabItems = [
    {
      key: 'business',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBuildingStore size={18} />
          Información de la Empresa
        </span>
      ),
      children: <BusinessInfoForm />,
    },
    {
      key: 'storefront',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconShoppingCart size={18} />
          Configuración del Storefront
        </span>
      ),
      children: <StorefrontSettingsForm />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <IconSettings size={28} />
          <Title level={2} style={{ marginBottom: 0 }}>
            Configuración
          </Title>
        </div>
        <Text type="secondary">
          Gestiona la información de tu empresa y personaliza la apariencia de tu tienda en línea.
          Los cambios se reflejarán inmediatamente en el storefront.
        </Text>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="business"
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Card>
    </div>
  );
};
