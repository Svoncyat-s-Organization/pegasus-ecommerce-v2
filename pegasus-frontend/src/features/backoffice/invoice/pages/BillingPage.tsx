import { Card, Tabs, Typography } from 'antd';
import { BillingInvoicesTab } from './BillingInvoicesTab';
import { BillingPaymentsTab } from './BillingPaymentsTab';
import { BillingPaymentMethodsTab } from './BillingPaymentMethodsTab';
import { BillingDocumentSeriesTab } from './BillingDocumentSeriesTab';

const { Title, Text } = Typography;

export const BillingPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Facturación
        </Title>
        <Text type="secondary">Gestión de comprobantes, pagos y métodos de pago.</Text>
      </div>

      <Tabs
        defaultActiveKey="invoices"
        destroyInactiveTabPane
        items={[
          {
            key: 'invoices',
            label: 'Comprobantes',
            children: <BillingInvoicesTab />,
          },
          {
            key: 'series',
            label: 'Series',
            children: <BillingDocumentSeriesTab />,
          },
          {
            key: 'payments',
            label: 'Pagos',
            children: <BillingPaymentsTab />,
          },
          {
            key: 'payment-methods',
            label: 'Métodos de pago',
            children: <BillingPaymentMethodsTab />,
          },
        ]}
      />
    </Card>
  );
};
