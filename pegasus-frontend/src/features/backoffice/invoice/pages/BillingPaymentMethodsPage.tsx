import { Card, Typography } from 'antd';
import { BillingPaymentMethodsTab } from './BillingPaymentMethodsTab';

const { Title, Text } = Typography;

export const BillingPaymentMethodsPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Facturación - Métodos de pago
        </Title>
        <Text type="secondary">Gestión de métodos de pago.</Text>
      </div>

      <BillingPaymentMethodsTab />
    </Card>
  );
};
