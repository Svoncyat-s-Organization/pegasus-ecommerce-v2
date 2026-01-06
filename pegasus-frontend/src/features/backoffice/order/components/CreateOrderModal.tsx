import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  Divider,
  Table,
  Typography,
  Tabs,
  Row,
  Col,
  Card,
} from 'antd';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@features/backoffice/customer/api/customersApi';
import { getVariants } from '@features/backoffice/catalog/api/variantsApi';
import { getProducts } from '@features/backoffice/catalog/api/productsApi';
import { locationsApi } from '@shared/api/locationsApi';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import { formatCurrency } from '@shared/utils/formatters';
import type { CreateOrderRequest, VariantResponse, ProductResponse, CustomerResponse } from '@types';

const { Text } = Typography;

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateOrderRequest) => Promise<void>;
  isLoading: boolean;
}

interface OrderItem {
  variantId: number;
  quantity: number;
  price?: number;
  sku?: string;
  productName?: string;
}

export const CreateOrderModal = ({ open, onClose, onSubmit, isLoading }: CreateOrderModalProps) => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>();
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();

  // Fetch customers para el selector
  const { data: customersData } = useQuery({
    queryKey: ['customers', 0, 100],
    queryFn: () => customersApi.getCustomers(0, 100),
  });

  // Fetch customer addresses cuando se selecciona un cliente
  const { data: customerAddresses } = useQuery({
    queryKey: ['customerAddresses', selectedCustomerId],
    queryFn: () => customersApi.getCustomerAddresses(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

  // Fetch variants para los items
  const { data: variantsData } = useQuery({
    queryKey: ['variants', 0, 1000],
    queryFn: () => getVariants(0, 1000),
  });

  // Fetch products para obtener nombres
  const { data: productsData } = useQuery({
    queryKey: ['products', 0, 1000],
    queryFn: () => getProducts(0, 1000),
  });

  // Hooks de ubicación
  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  // Calcular total cuando cambian los items
  useEffect(() => {
    const newTotal = orderItems.reduce((sum, item) => {
      const subtotal = (item.price || 0) * item.quantity;
      return sum + subtotal;
    }, 0);
    setTotal(newTotal);
  }, [orderItems]);

  // Sincronizar items del form con estado local
  useEffect(() => {
    const items = form.getFieldValue('items') || [];
    const enrichedItems = items.map((item: any) => {
      const variant = variantsData?.content.find((v: VariantResponse) => v.id === item.variantId);
      const product = productsData?.content.find(
        (p: ProductResponse) => p.id === variant?.productId
      );
      return {
        variantId: item.variantId,
        quantity: item.quantity || 1,
        price: variant?.price,
        sku: variant?.sku,
        productName: product?.name,
      };
    });
    setOrderItems(enrichedItems);
  }, [form.getFieldValue('items'), variantsData, productsData]);

  // Auto-rellenar datos del cliente cuando se selecciona
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!selectedCustomerId || !customerAddresses || customerAddresses.length === 0) {
        console.log('No loading customer data:', { selectedCustomerId, hasAddresses: !!customerAddresses });
        return;
      }

      const selectedCustomer = customersData?.content.find(
        (c: CustomerResponse) => c.id === selectedCustomerId
      );
      if (!selectedCustomer) {
        console.log('Customer not found');
        return;
      }

      console.log('Loading customer data:', selectedCustomer);
      console.log('Customer addresses:', customerAddresses);

      // Buscar dirección de envío por defecto
      const defaultAddress = customerAddresses.find((addr) => addr.isDefaultShipping);
      const addressToUse = defaultAddress || customerAddresses[0];

      console.log('Address to use:', addressToUse);

      if (addressToUse) {
        // Obtener ubicación desde ubigeoId
        try {
          // El ubigeoId es del distrito, necesitamos obtener departamento y provincia
          const ubigeo = await locationsApi.getUbigeoById(addressToUse.ubigeoId);
          
          console.log('Ubigeo loaded:', ubigeo);

          // Primero establecer los estados para que los selectores se habiliten
          setSelectedDepartment(ubigeo.departmentId);
          setSelectedProvince(ubigeo.provinceId);

          // Luego establecer los valores del form
          form.setFieldsValue({
            recipientName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
            recipientPhone: selectedCustomer.phone || '',
            department: ubigeo.departmentId,
            province: ubigeo.provinceId,
            district: addressToUse.ubigeoId,
            address: addressToUse.address,
            reference: addressToUse.reference || '',
          });

          console.log('Form values set successfully');
        } catch (error) {
          console.error('Error loading ubigeo:', error);
          // Si no se puede obtener el ubigeo, al menos rellenar nombre y teléfono
          form.setFieldsValue({
            recipientName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
            recipientPhone: selectedCustomer.phone || '',
          });
        }
      } else {
        console.log('No address found, filling only name and phone');
        // Si no hay direcciones, solo rellenar nombre y teléfono
        form.setFieldsValue({
          recipientName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          recipientPhone: selectedCustomer.phone || '',
        });
      }
    };

    loadCustomerData();
  }, [selectedCustomerId, customerAddresses, customersData, form]);

  const handleSubmit = async (values: any) => {
    try {
      const request: CreateOrderRequest = {
        customerId: values.customerId,
        items: values.items.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          ubigeoId: values.district, // El distrito es el nivel más específico del ubigeo
          address: values.address,
          reference: values.reference,
          recipientName: values.recipientName,
          recipientPhone: values.recipientPhone,
        },
      };

      await onSubmit(request);
      form.resetFields();
      setOrderItems([]);
      setSelectedDepartment(undefined);
      setSelectedProvince(undefined);
      onClose();
    } catch {
      // Error handled in parent
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOrderItems([]);
    setSelectedCustomerId(undefined);
    setSelectedDepartment(undefined);
    setSelectedProvince(undefined);
    onClose();
  };

  const handleVariantChange = (variantId: number, index: number) => {
    const variant = variantsData?.content.find((v: VariantResponse) => v.id === variantId);
    const product = productsData?.content.find((p: ProductResponse) => p.id === variant?.productId);
    const items = form.getFieldValue('items');
    items[index] = {
      ...items[index],
      variantId,
    };
    form.setFieldsValue({ items });

    // Actualizar estado local
    const newItems = [...orderItems];
    newItems[index] = {
      variantId,
      quantity: items[index].quantity || 1,
      price: variant?.price,
      sku: variant?.sku,
      productName: product?.name,
    };
    setOrderItems(newItems);
  };

  const handleQuantityChange = (quantity: number, index: number) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      quantity,
    };
    setOrderItems(newItems);
  };

  const itemColumns = [
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || 'Seleccione producto'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: {record.sku || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (price ? formatCurrency(price) : '-'),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 120,
      render: (_: unknown, record: OrderItem) => {
        const subtotal = (record.price || 0) * record.quantity;
        return <Text strong>{formatCurrency(subtotal)}</Text>;
      },
    },
  ];

  // Crear mapa de productos para búsqueda rápida
  const productsMap = new Map(
    productsData?.content.map((p: ProductResponse) => [p.id, p.name]) || []
  );

  return (
    <Modal
      title="Crear Nuevo Pedido"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      width={900}
      okText="Crear Pedido"
      cancelText="Cancelar"
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          items: [{ variantId: undefined, quantity: 1 }],
        }}
      >
        <Form.Item
          name="customerId"
          label="Cliente"
          rules={[{ required: true, message: 'Seleccione el cliente' }]}
        >
          <Select
            showSearch
            placeholder="Buscar cliente por nombre o email"
            optionFilterProp="children"
            onChange={(value) => setSelectedCustomerId(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={customersData?.content.map((customer) => ({
              label: `${customer.firstName} ${customer.lastName} - ${customer.email}`,
              value: customer.id,
            }))}
            loading={!customersData}
          />
        </Form.Item>

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Items del Pedido',
              children: (
                <>
                  <Form.List name="items">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Space
                            key={key}
                            style={{ display: 'flex', marginBottom: 16 }}
                            align="start"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'variantId']}
                              rules={[{ required: true, message: 'Seleccione producto' }]}
                              style={{ width: 500, marginBottom: 0 }}
                            >
                              <Select
                                showSearch
                                placeholder="Buscar producto por nombre o SKU"
                                optionFilterProp="children"
                                onChange={(value) => handleVariantChange(value, index)}
                                filterOption={(input, option) => {
                                  const searchText = input.toLowerCase();
                                  const label = (option?.label ?? '').toLowerCase();
                                  return label.includes(searchText);
                                }}
                                options={variantsData?.content.map((variant: VariantResponse) => {
                                  const productName =
                                    productsMap.get(variant.productId) || 'Producto sin nombre';
                                  return {
                                    label: `${productName} - SKU: ${variant.sku} - ${formatCurrency(variant.price)}`,
                                    value: variant.id,
                                  };
                                })}
                                loading={!variantsData || !productsData}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[
                                { required: true, message: 'Requerido' },
                                { type: 'number', min: 1, message: 'Mínimo 1' },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="Cant."
                                min={1}
                                style={{ width: 100 }}
                                onChange={(value) => handleQuantityChange(value || 1, index)}
                              />
                            </Form.Item>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                danger
                                icon={<IconTrash size={16} />}
                                onClick={() => {
                                  remove(name);
                                  const newItems = orderItems.filter((_, i) => i !== index);
                                  setOrderItems(newItems);
                                }}
                              />
                            )}
                          </Space>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<IconPlus size={16} />}
                          >
                            Agregar Item
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  {/* Resumen de items */}
                  {orderItems.length > 0 && orderItems[0].variantId && (
                    <Card style={{ marginTop: 24, backgroundColor: '#fafafa' }}>
                      <Table
                        dataSource={orderItems}
                        columns={itemColumns}
                        pagination={false}
                        size="small"
                        bordered
                        rowKey={(_, index) => `item-${index}`}
                        summary={() => (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={3} align="right">
                                <Text strong>Total:</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1}>
                                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                  {formatCurrency(total)}
                                </Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}
                      />
                    </Card>
                  )}
                </>
              ),
            },
            {
              key: '2',
              label: 'Dirección de Envío',
              children: (
                <>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="recipientName"
                        label="Nombre del Destinatario"
                        rules={[
                          { required: true, message: 'Ingrese el nombre del destinatario' },
                        ]}
                      >
                        <Input placeholder="Ej: Juan Pérez" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="recipientPhone"
                        label="Teléfono del Destinatario"
                        rules={[
                          { required: true, message: 'Ingrese el teléfono' },
                          {
                            pattern: /^9\d{8}$/,
                            message: 'Debe ser 9 dígitos e iniciar con 9',
                          },
                        ]}
                      >
                        <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
                    Ubicación
                  </Divider>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="department"
                        label="Departamento"
                        rules={[{ required: true, message: 'Seleccione departamento' }]}
                      >
                        <Select
                          placeholder="Seleccione"
                          showSearch
                          optionFilterProp="children"
                          onChange={(value) => {
                            setSelectedDepartment(value);
                            setSelectedProvince(undefined);
                            form.setFieldsValue({ province: undefined, district: undefined });
                          }}
                          options={departments?.map((dept) => ({
                            label: dept.name,
                            value: dept.id,
                          }))}
                          loading={!departments}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="province"
                        label="Provincia"
                        rules={[{ required: true, message: 'Seleccione provincia' }]}
                      >
                        <Select
                          placeholder="Seleccione"
                          showSearch
                          optionFilterProp="children"
                          disabled={!selectedDepartment}
                          onChange={(value) => {
                            setSelectedProvince(value);
                            form.setFieldsValue({ district: undefined });
                          }}
                          options={provinces?.map((prov) => ({
                            label: prov.name,
                            value: prov.id,
                          }))}
                          loading={selectedDepartment && !provinces}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="district"
                        label="Distrito"
                        rules={[{ required: true, message: 'Seleccione distrito' }]}
                      >
                        <Select
                          placeholder="Seleccione"
                          showSearch
                          optionFilterProp="children"
                          disabled={!selectedProvince}
                          options={districts?.map((dist) => ({
                            label: dist.name,
                            value: dist.id,
                          }))}
                          loading={selectedProvince && !districts}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
                    Detalles de Dirección
                  </Divider>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="address"
                        label="Dirección Completa"
                        rules={[{ required: true, message: 'Ingrese la dirección completa' }]}
                      >
                        <Input.TextArea
                          placeholder="Ej: Av. Los Alamos 123, Urb. Las Flores"
                          rows={3}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item name="reference" label="Referencia (Opcional)">
                        <Input.TextArea
                          placeholder="Ej: Casa de dos pisos, portón verde, cerca al parque principal"
                          rows={2}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
