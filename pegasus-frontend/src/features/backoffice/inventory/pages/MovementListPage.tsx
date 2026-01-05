import { Card, Typography, Select, Button, DatePicker } from 'antd';
import { IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useMovements } from '../hooks/useMovements';
import { useActiveWarehouses } from '../hooks/useWarehouseDetail';
import { MovementList } from '../components/MovementList';
import { OPERATION_TYPE_LABELS } from '../constants/inventoryConstants';
import type { OperationType } from '@types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const MovementListPage = () => {
  const {
    data,
    isLoading,
    refetch,
    page,
    pageSize,
    warehouseFilter,
    operationTypeFilter,
    handleWarehouseFilter,
    handleOperationTypeFilter,
    handleDateRangeFilter,
    handlePageChange,
  } = useMovements();

  const { data: warehouses } = useActiveWarehouses();

  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      handleDateRangeFilter(undefined, undefined);
      return;
    }
    handleDateRangeFilter(
      dates[0].startOf('day').toISOString(),
      dates[1].endOf('day').toISOString()
    );
  };

  const operationTypeOptions = Object.entries(OPERATION_TYPE_LABELS).map(([key, label]) => ({
    label,
    value: key,
  }));

  return (
    <Card>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Kardex - Movimientos de Inventario
        </Title>
        <Text type="secondary">
          Historial completo de todos los movimientos de stock (entradas, salidas, transferencias, ajustes).
        </Text>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Select
          placeholder="Filtrar por almacén"
          value={warehouseFilter}
          onChange={handleWarehouseFilter}
          allowClear
          style={{ width: 250 }}
          options={warehouses?.map((w) => ({
            label: `${w.code} - ${w.name}`,
            value: w.id,
          }))}
          showSearch
          optionFilterProp="label"
        />

        <Select
          placeholder="Tipo de operación"
          value={operationTypeFilter}
          onChange={(value) => handleOperationTypeFilter(value as OperationType | undefined)}
          allowClear
          style={{ width: 220 }}
          options={operationTypeOptions}
        />

        <RangePicker
          placeholder={['Fecha inicio', 'Fecha fin']}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          style={{ width: 280 }}
        />

        <Button icon={<IconRefresh size={16} />} onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      {/* Table */}
      <MovementList
        data={data?.content || []}
        loading={isLoading}
        total={data?.totalElements || 0}
        currentPage={page + 1}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </Card>
  );
};
