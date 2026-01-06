import { Card, Typography } from 'antd';
import { BillingDocumentSeriesTab } from './BillingDocumentSeriesTab';

const { Title, Text } = Typography;

export const BillingDocumentSeriesPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Facturación - Series
        </Title>
        <Text type="secondary">Gestión de series de comprobantes.</Text>
      </div>

      <BillingDocumentSeriesTab />
    </Card>
  );
};
