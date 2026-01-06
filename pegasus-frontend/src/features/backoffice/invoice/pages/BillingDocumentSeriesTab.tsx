import { useState } from 'react';
import { Button, Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IconEdit, IconPlus, IconPower, IconRefresh, IconSearch } from '@tabler/icons-react';
import type { DocumentSeriesResponse, DocumentSeriesType } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { DocumentSeriesFormModal } from '../components/DocumentSeriesFormModal';
import { useBillingDocumentSeries } from '../hooks/useBillingDocumentSeries';
import { useToggleBillingDocumentSeries } from '../hooks/useBillingDocumentSeriesMutations';

const DOCUMENT_TYPE_LABEL: Record<DocumentSeriesType, string> = {
  BILL: 'Boleta',
  INVOICE: 'Factura',
  CREDIT_NOTE: 'Nota de crédito',
};

export const BillingDocumentSeriesTab = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<DocumentSeriesResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data, isLoading, refetch, isFetching } = useBillingDocumentSeries(page, pageSize, debouncedSearch || undefined);
  const toggleStatus = useToggleBillingDocumentSeries();

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelected(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (record: DocumentSeriesResponse) => {
    setFormMode('edit');
    setSelected(record);
    setFormOpen(true);
  };

  const columns: ColumnsType<DocumentSeriesResponse> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (page * pageSize) + index + 1,
    },
    {
      title: 'Tipo',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 160,
      render: (value: DocumentSeriesType) => DOCUMENT_TYPE_LABEL[value] || value,
    },
    {
      title: 'Serie',
      dataIndex: 'series',
      key: 'series',
      width: 120,
    },
    {
      title: 'Correlativo',
      dataIndex: 'currentNumber',
      key: 'currentNumber',
      width: 140,
      render: (value: number) => String(value ?? 0),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleOpenEdit(record)}
            title="Editar"
          />
          <Button
            type="link"
            size="small"
            icon={<IconPower size={16} />}
            disabled={toggleStatus.isPending}
            onClick={() => toggleStatus.mutate(record.id)}
            title={record.isActive ? 'Desactivar' : 'Activar'}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Input
          placeholder="Buscar por serie o tipo..."
          prefix={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          allowClear
          style={{ maxWidth: 360 }}
        />

        <Space>
          <Button icon={<IconRefresh size={18} />} onClick={() => refetch()} loading={isFetching} title="Actualizar lista">
            Actualizar
          </Button>
          <Button type="primary" icon={<IconPlus size={18} />} onClick={handleOpenCreate}>
            Nueva serie
          </Button>
        </Space>
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
          showTotal: (total) => `Total: ${total} series`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <DocumentSeriesFormModal
        open={formOpen}
        mode={formMode}
        initialValue={selected}
        onCancel={() => setFormOpen(false)}
      />
    </>
  );
};
