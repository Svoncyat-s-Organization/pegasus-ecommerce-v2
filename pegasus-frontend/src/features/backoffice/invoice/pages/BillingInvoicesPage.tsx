import { Card, Typography } from 'antd';
import { BillingInvoicesTab } from './BillingInvoicesTab';

const { Title, Text } = Typography;

export const BillingInvoicesPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Facturación - Comprobantes
        </Title>
        <Text type="secondary">Gestión de comprobantes.</Text>
      </div>

      <BillingInvoicesTab />
    </Card>
  );
};
