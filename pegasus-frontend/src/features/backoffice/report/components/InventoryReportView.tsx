import { Card, Table, Row, Col, Statistic, Empty, Spin, Alert, Button } from 'antd';
import { IconPackages, IconCurrencyDollar, IconBuildingWarehouse, IconRefresh } from '@tabler/icons-react';
import type { ColumnsType } from 'antd/es/table';
import { useInventoryReport } from '../hooks/useReports';
import { ExportButton } from './ExportButton';
import { exportInventoryReportCSV } from '../utils/exportUtils';
import { formatCurrency, formatDate } from '@shared/utils/formatters';
import type { InventoryWarehouseRow } from '@types';

export const InventoryReportView = () => {
  const { data, isLoading, error, refetch, isRefetching } = useInventoryReport(true);

  const handleExport = () => {
    if (data) {
      exportInventoryReportCSV(data);
    }
  };

  const columns: ColumnsType<InventoryWarehouseRow> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Variantes',
      dataIndex: 'variantCount',
      key: 'variantCount',
      align: 'right',
      width: 120,
    },
    {
      title: 'Unidades',
      dataIndex: 'units',
      key: 'units',
      align: 'right',
      width: 120,
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      width: 150,
      render: (val: number) => formatCurrency(val),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>
              Reporte generado al: {data ? formatDate(data.reportDate) : '-'}
            </span>
            <Button
              icon={<IconRefresh size={16} />}
              onClick={() => refetch()}
              loading={isRefetching}
            >
              Actualizar
            </Button>
          </div>
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
            <Spin size="large" tip="Cargando inventario..." />
          </div>
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
                  title="Total Variantes"
                  value={data.totalVariants}
                  prefix={<IconPackages size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Unidades"
                  value={data.totalUnits}
                  prefix={<IconBuildingWarehouse size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Valor Total Inventario"
                  value={data.totalValue}
                  precision={2}
                  prefix={<IconCurrencyDollar size={20} />}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Detail Table */}
          <Card title="Inventario por Almacén">
            {data.byWarehouse.length > 0 ? (
              <Table
                columns={columns}
                dataSource={data.byWarehouse}
                rowKey="warehouseId"
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
                        <strong>{data.totalVariants}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>{data.totalUnits}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong>{formatCurrency(data.totalValue)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            ) : (
              <Empty description="No hay inventario registrado" />
            )}
          </Card>
        </>
      )}
    </div>
  );
};
