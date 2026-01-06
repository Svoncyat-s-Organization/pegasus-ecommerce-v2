import { useState } from 'react';
import { Card, Table, Row, Col, Statistic, Empty, Spin, Alert } from 'antd';
import { IconPackage, IconCurrencyDollar, IconBuildingStore } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { usePurchaseReport } from '../hooks/useReports';
import { ReportFilters } from './ReportFilters';
import { ExportButton } from './ExportButton';
import { exportPurchaseReportCSV } from '../utils/exportUtils';
import { formatCurrency } from '@shared/utils/formatters';
import type { PurchaseReportRow } from '@types';

export const PurchaseReportView = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [searchTrigger, setSearchTrigger] = useState(0);

  const startStr = startDate?.format('YYYY-MM-DD') || '';
  const endStr = endDate?.format('YYYY-MM-DD') || '';

  const { data, isLoading, error, refetch } = usePurchaseReport(
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
      exportPurchaseReportCSV(data);
    }
  };

  const columns: ColumnsType<PurchaseReportRow> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'RUC/DNI',
      dataIndex: 'supplierDocNumber',
      key: 'supplierDocNumber',
      width: 120,
    },
    {
      title: 'Proveedor',
      dataIndex: 'supplierName',
      key: 'supplierName',
      ellipsis: true,
    },
    {
      title: 'Órdenes de Compra',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      align: 'right',
      width: 150,
    },
    {
      title: 'Monto Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      width: 140,
      render: (val: number) => formatCurrency(val),
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
                  title="Total de Compras"
                  value={data.totalPurchases}
                  prefix={<IconPackage size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Monto Total"
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
                  title="Proveedores Activos"
                  value={data.bySupplier.length}
                  prefix={<IconBuildingStore size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Detail Table */}
          <Card title="Compras por Proveedor">
            <Table
              columns={columns}
              dataSource={data.bySupplier}
              rowKey="supplierId"
              bordered
              size="small"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} proveedores`,
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>TOTAL</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{data.totalPurchases}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>{formatCurrency(data.totalAmount)}</strong>
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
