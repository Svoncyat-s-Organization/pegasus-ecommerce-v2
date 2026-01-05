import { useMemo, useState } from 'react';
import { Button, Input, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { OrderSummaryResponse, PaymentResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { formatCurrency } from '@shared/utils/formatters';
import { PaymentFormModal } from '../components/PaymentFormModal';
import { useBillingPaymentMethods } from '../hooks/useBillingPaymentMethods';
import { useBillingPayments } from '../hooks/useBillingPayments';
import { useAdminOrders } from '../hooks/useAdminOrders';

const { Text } = Typography;

export const BillingPaymentsTab = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [orderId, setOrderId] = useState<number | undefined>(undefined);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(undefined);

  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 500);
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders(0, 20, debouncedOrderSearch || undefined);

  const orderOptions = useMemo(() => {
    const orders = ordersData?.content || [];
    return orders.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} - ${o.customerName}`,
    }));
  }, [ordersData]);

  const [createOpen, setCreateOpen] = useState(false);

  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useBillingPaymentMethods(0, 200);

  const paymentMethodOptions = useMemo(() => {
    return (paymentMethodsData?.content || []).map((m) => ({ label: m.name, value: m.id }));
  }, [paymentMethodsData]);

  const { data, isLoading } = useBillingPayments(page, pageSize, {
    search: debouncedSearch || undefined,
    orderId,
    paymentMethodId,
  });

  const columns: ColumnsType<PaymentResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
    },
    {
      title: 'Pedido',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 90,
    },
    {
      title: 'Método',
      key: 'method',
      width: 180,
      render: (_, record) => <Text>{record.paymentMethodName || '-'}</Text>,
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 180,
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Fecha',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 170,
      render: (value: string | undefined) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por transaction ID..."
            prefix={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            allowClear
            style={{ maxWidth: 320 }}
          />

          <Select
            placeholder="Pedido"
            allowClear
            style={{ width: 260 }}
            value={orderId}
            showSearch
            filterOption={false}
            onSearch={(value) => setOrderSearchTerm(value)}
            options={orderOptions}
            loading={isLoadingOrders}
            onChange={(value) => {
              setOrderId(typeof value === 'number' ? value : undefined);
              setPage(0);
            }}
            optionFilterProp="label"
          />

          <Select
            placeholder="Método de pago"
            allowClear
            style={{ width: 220 }}
            loading={isLoadingPaymentMethods}
            value={paymentMethodId}
            onChange={(value) => {
              setPaymentMethodId(value);
              setPage(0);
            }}
            options={paymentMethodOptions}
            showSearch
            optionFilterProp="label"
          />
        </div>

        <Button type="primary" icon={<IconPlus size={18} />} onClick={() => setCreateOpen(true)}>
          Registrar pago
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        bordered
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} pagos`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <PaymentFormModal open={createOpen} onCancel={() => setCreateOpen(false)} />
    </>
  );
};
