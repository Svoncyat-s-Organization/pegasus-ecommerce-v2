import { Card, Typography } from 'antd';
import { BillingPaymentsTab } from './BillingPaymentsTab';

const { Title, Text } = Typography;

export const BillingPaymentsPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Facturación - Pagos
        </Title>
        <Text type="secondary">Gestión de pagos.</Text>
      </div>

      <BillingPaymentsTab />
    </Card>
  );
};
