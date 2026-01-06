import { useState } from 'react';
import { Card, Table, Row, Col, Statistic, Empty, Spin, Alert } from 'antd';
import { IconCreditCard, IconCurrencyDollar, IconCash } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { usePaymentReport } from '../hooks/useReports';
import { ReportFilters } from './ReportFilters';
import { ExportButton } from './ExportButton';
import { exportPaymentReportCSV } from '../utils/exportUtils';
import { formatCurrency } from '@shared/utils/formatters';
import type { PaymentMethodRow } from '@types';

export const PaymentReportView = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [searchTrigger, setSearchTrigger] = useState(0);

  const startStr = startDate?.format('YYYY-MM-DD') || '';
  const endStr = endDate?.format('YYYY-MM-DD') || '';

  const { data, isLoading, error, refetch } = usePaymentReport(
    startStr,
    endStr,
    searchTrigger > 0
  );

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
    if (searchTrigger > 0) {
      refetch();
    }
  };

  const handleExport = () => {
    if (data) {
      exportPaymentReportCSV(data);
    }
  };

  const columns: ColumnsType<PaymentMethodRow> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Método de Pago',
      dataIndex: 'paymentMethodName',
      key: 'paymentMethodName',
    },
    {
      title: 'Cantidad de Pagos',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      width: 150,
    },
    {
      title: 'Monto Total',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 150,
      render: (val: number) => formatCurrency(val),
    },
  ];

  // Calculate average payment if we have data
  const averagePayment = data && data.totalPayments > 0
    ? data.totalAmount / data.totalPayments
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <ReportFilters
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onSearch={handleSearch}
            loading={isLoading}
          />
          <ExportButton onExportCSV={handleExport} disabled={!data} />
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Alert
          type="error"
          message="Error al cargar el reporte"
          description={(error as Error).message}
          showIcon
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spin size="large" tip="Generando reporte..." />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !data && searchTrigger === 0 && (
        <Card>
          <Empty
            description="Selecciona un rango de fechas y haz clic en 'Generar Reporte'"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Data */}
      {data && !isLoading && (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total de Pagos"
                  value={data.totalPayments}
                  prefix={<IconCreditCard size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Monto Total Recaudado"
                  value={data.totalAmount}
                  precision={2}
                  prefix={<IconCurrencyDollar size={20} />}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Pago Promedio"
                  value={averagePayment}
                  precision={2}
                  prefix={<IconCash size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Detail Table */}
          <Card title="Pagos por Método">
            {data.byPaymentMethod.length > 0 ? (
              <Table
                columns={columns}
                dataSource={data.byPaymentMethod}
                rowKey="paymentMethodId"
                bordered
                size="small"
                pagination={false}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>TOTAL</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{data.totalPayments}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>{formatCurrency(data.totalAmount)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            ) : (
              <Empty description="No hay pagos registrados en el período" />
            )}
          </Card>
        </>
      )}
    </div>
  );
};
