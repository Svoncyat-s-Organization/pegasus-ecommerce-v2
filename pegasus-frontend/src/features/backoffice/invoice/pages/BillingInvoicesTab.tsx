import { useState } from 'react';
import { Button, Input, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IconEdit, IconEye, IconPlus, IconPrinter, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { InvoiceStatus, InvoiceSummaryResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { formatCurrency } from '@shared/utils/formatters';
import { INVOICE_STATUS_META, INVOICE_TYPE_LABEL } from '../constants/billingConstants';
import { InvoiceDetailModal } from '../components/InvoiceDetailModal';
import { InvoiceFormModal } from '../components/InvoiceFormModal';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { InvoiceStatusModal } from '../components/InvoiceStatusModal';
import { useBillingInvoices } from '../hooks/useBillingInvoices';

export const BillingInvoicesTab = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<InvoiceStatus | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data, isLoading } = useBillingInvoices(page, pageSize, debouncedSearch || undefined, status);

  const handleOpenDetail = (id: number) => {
    setSelectedInvoiceId(id);
    setDetailOpen(true);
  };

  const handleOpenStatus = (id: number, current: InvoiceStatus) => {
    setSelectedInvoiceId(id);
    setSelectedInvoiceStatus(current);
    setStatusOpen(true);
  };

  const handleOpenPrint = (id: number) => {
    setSelectedInvoiceId(id);
    setPrintOpen(true);
  };

  const columns: ColumnsType<InvoiceSummaryResponse> = [
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
      title: 'Tipo',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 120,
      render: (value: InvoiceSummaryResponse['invoiceType']) => INVOICE_TYPE_LABEL[value],
    },
    {
      title: 'Serie-Número',
      key: 'seriesNumber',
      width: 160,
      render: (_, record) => `${record.series}-${record.number}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: InvoiceStatus) => <Tag color={INVOICE_STATUS_META[value].color}>{INVOICE_STATUS_META[value].text}</Tag>,
    },
    {
      title: 'Emisión',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 170,
      render: (value: string | undefined) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => handleOpenDetail(record.id)}
            title="Ver detalle"
          />
          <Button
            type="link"
            size="small"
            icon={<IconPrinter size={16} />}
            onClick={() => handleOpenPrint(record.id)}
            disabled={record.status !== 'ISSUED'}
            title={record.status === 'ISSUED' ? 'Imprimir' : 'Solo disponible para comprobantes emitidos'}
          />
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleOpenStatus(record.id, record.status)}
            title="Actualizar estado"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por serie o número..."
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
            placeholder="Estado"
            allowClear
            style={{ width: 180 }}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(0);
            }}
            options={(Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]).map((s) => ({
              value: s,
              label: INVOICE_STATUS_META[s].text,
            }))}
          />
        </div>
        <Button type="primary" icon={<IconPlus size={18} />} onClick={() => setCreateOpen(true)}>
          Nuevo comprobante
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
          showTotal: (total) => `Total: ${total} comprobantes`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <InvoiceFormModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreated={(invoiceId) => {
          setSelectedInvoiceId(invoiceId);
          setPrintOpen(true);
        }}
      />

      <InvoiceDetailModal
        open={detailOpen}
        invoiceId={selectedInvoiceId}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedInvoiceId(null);
        }}
      />

      <InvoicePrintModal
        open={printOpen}
        invoiceId={selectedInvoiceId}
        onCancel={() => {
          setPrintOpen(false);
          setSelectedInvoiceId(null);
        }}
      />

      <InvoiceStatusModal
        open={statusOpen}
        invoiceId={selectedInvoiceId}
        currentStatus={selectedInvoiceStatus}
        onCancel={() => {
          setStatusOpen(false);
          setSelectedInvoiceId(null);
          setSelectedInvoiceStatus(null);
        }}
      />
    </>
  );
};
