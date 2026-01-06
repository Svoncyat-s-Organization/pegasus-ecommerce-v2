import { useState } from 'react';
import { Card, Table, Row, Col, Statistic, Empty, Spin, Alert } from 'antd';
import { IconCurrencyDollar, IconShoppingCart, IconReceipt } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useSalesReport } from '../hooks/useReports';
import { ReportFilters } from './ReportFilters';
import { ExportButton } from './ExportButton';
import { exportSalesReportCSV } from '../utils/exportUtils';
import { formatCurrency, formatDate } from '@shared/utils/formatters';
import type { SalesReportRow } from '@types';

export const SalesReportView = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [searchTrigger, setSearchTrigger] = useState(0);

  const startStr = startDate?.format('YYYY-MM-DD') || '';
  const endStr = endDate?.format('YYYY-MM-DD') || '';

  const { data, isLoading, error, refetch } = useSalesReport(
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
      exportSalesReportCSV(data);
    }
  };

  const columns: ColumnsType<SalesReportRow> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Pedidos',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right',
    },
    {
      title: 'Ventas',
      dataIndex: 'sales',
      key: 'sales',
      align: 'right',
      render: (sales: number) => formatCurrency(sales),
    },
  ];

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
                  title="Total de Pedidos"
                  value={data.totalOrders}
                  prefix={<IconShoppingCart size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Ventas Totales"
                  value={data.totalSales}
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
                  title="Ticket Promedio"
                  value={data.averageTicket}
                  precision={2}
                  prefix={<IconReceipt size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Detail Table */}
          <Card title="Detalle por Día">
            <Table
              columns={columns}
              dataSource={data.details}
              rowKey="date"
              bordered
              size="small"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} días`,
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>TOTAL</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{data.totalOrders}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>{formatCurrency(data.totalSales)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
};
