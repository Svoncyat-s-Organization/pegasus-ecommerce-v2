import { Card, Alert, Collapse, List, Tag, Typography, Empty } from 'antd';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { LowStockProductResponse } from '@types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface LowStockAlertProps {
  data?: LowStockProductResponse[];
  count?: number;
  loading?: boolean;
}

export const LowStockAlert = ({ data, count, loading }: LowStockAlertProps) => {
  if (loading) {
    return (
      <Card>
        <Title level={4}>Alertas de Inventario</Title>
        <Alert type="warning" message="Cargando..." showIcon />
      </Card>
    );
  }

  if (!count || count === 0) {
    return (
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          Alertas de Inventario
        </Title>
        <Alert
          type="success"
          message="Stock saludable"
          description="No hay productos con stock bajo en este momento."
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        Alertas de Inventario
      </Title>
      <Alert
        type="warning"
        showIcon
        icon={<IconAlertTriangle size={20} />}
        message={`${count} productos con stock bajo`}
        description={
          data && data.length > 0 ? (
            <Collapse
              ghost
              bordered={false}
              style={{ marginTop: 12 }}
              expandIconPosition="end"
            >
              <Panel header="Ver detalles" key="1">
                <List
                  dataSource={data}
                  renderItem={(item) => (
                    <List.Item
                      key={item.variantId}
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ fontSize: 14 }}>
                            {item.productName}
                          </Text>
                        }
                        description={
                          <div style={{ fontSize: 12 }}>
                            <Text type="secondary">SKU: {item.variantSku}</Text>
                            <br />
                            <Text type="secondary">Almacén: {item.warehouseName}</Text>
                          </div>
                        }
                      />
                      <div style={{ textAlign: 'right' }}>
                        <Tag
                          color={
                            item.availableStock <= 5
                              ? 'error'
                              : item.availableStock <= 10
                              ? 'warning'
                              : 'orange'
                          }
                        >
                          {item.availableStock} unidades
                        </Tag>
                        {item.reservedStock > 0 && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Reservado: {item.reservedStock}
                            </Text>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          ) : (
            <Empty
              description="No hay detalles disponibles"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 12 }}
            />
          )
        }
      />
    </Card>
  );
};
