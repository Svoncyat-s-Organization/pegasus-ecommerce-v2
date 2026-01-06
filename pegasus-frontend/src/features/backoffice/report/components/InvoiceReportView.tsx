import { useState } from 'react';
import { Card, Table, Row, Col, Statistic, Empty, Spin, Alert, Tag } from 'antd';
import { IconFileInvoice, IconReceipt, IconCash } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useInvoiceReport } from '../hooks/useReports';
import { ReportFilters } from './ReportFilters';
import { ExportButton } from './ExportButton';
import { exportInvoiceReportCSV } from '../utils/exportUtils';
import { formatCurrency, formatDateTime } from '@shared/utils/formatters';
import {
  INVOICE_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../constants/reportConstants';
import type { InvoiceReportRow } from '@types';

export const InvoiceReportView = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [searchTrigger, setSearchTrigger] = useState(0);

  const startStr = startDate?.format('YYYY-MM-DD') || '';
  const endStr = endDate?.format('YYYY-MM-DD') || '';

  const { data, isLoading, error, refetch } = useInvoiceReport(
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
      exportInvoiceReportCSV(data);
    }
  };

  const columns: ColumnsType<InvoiceReportRow> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Documento',
      key: 'document',
      width: 140,
      render: (_, record) => `${record.series}-${record.number}`,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'INVOICE' ? 'blue' : 'cyan'}>
          {INVOICE_TYPE_LABELS[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Fecha Emisión',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'RUC/DNI',
      dataIndex: 'receiverTaxId',
      key: 'receiverTaxId',
      width: 120,
    },
    {
      title: 'Cliente',
      dataIndex: 'receiverName',
      key: 'receiverName',
      ellipsis: true,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      width: 110,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'IGV',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      align: 'right',
      width: 100,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      width: 110,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={INVOICE_STATUS_COLORS[status] || 'default'}>
          {INVOICE_STATUS_LABELS[status] || status}
        </Tag>
      ),
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
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Facturas Emitidas"
                  value={data.totalInvoices}
                  prefix={<IconFileInvoice size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Boletas Emitidas"
                  value={data.totalBills}
                  prefix={<IconReceipt size={20} />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="IGV Total"
                  value={data.totalTaxAmount}
                  precision={2}
                  prefix={<IconCash size={20} />}
                  valueStyle={{ color: '#faad14' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Monto Total"
                  value={data.totalAmount}
                  precision={2}
                  prefix={<IconCash size={20} />}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Detail Table */}
          <Card title="Detalle de Documentos">
            <Table
              columns={columns}
              dataSource={data.documents}
              rowKey="id"
              bordered
              size="small"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} documentos`,
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};
