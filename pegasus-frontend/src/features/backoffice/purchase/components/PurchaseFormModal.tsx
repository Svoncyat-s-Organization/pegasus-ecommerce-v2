import { useMemo, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, message } from 'antd';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { CreatePurchaseRequest, ProductResponse, VariantResponse } from '@types';
import { useAuthStore } from '@stores/backoffice/authStore';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useProducts } from '@features/backoffice/catalog';
import { getVariantsByProductId } from '@features/backoffice/catalog/api/variantsApi';
import { useActiveWarehouses } from '../hooks/useActiveWarehouses';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCreatePurchase } from '../hooks/usePurchaseMutations';

interface PurchaseFormModalProps {
  open: boolean;
  onCancel: () => void;
}

export const PurchaseFormModal = ({ open, onCancel }: PurchaseFormModalProps) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  const createPurchase = useCreatePurchase();

  const [supplierSearch, setSupplierSearch] = useState('');
  const debouncedSupplierSearch = useDebounce(supplierSearch, 500);

  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 500);

  const [variantsByProduct, setVariantsByProduct] = useState<Record<number, VariantResponse[]>>({});
  const [variantsLoadingByProduct, setVariantsLoadingByProduct] = useState<Record<number, boolean>>({});

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers(0, 50, debouncedSupplierSearch || undefined);
  const { data: warehouses, isLoading: isLoadingWarehouses } = useActiveWarehouses();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(0, 50, debouncedProductSearch || undefined);

  const supplierOptions = useMemo(() => {
    return (suppliersData?.content || []).map((s) => ({
      label: `${s.companyName} (${s.docType} ${s.docNumber})`,
      value: s.id,
    }));
  }, [suppliersData]);

  const warehouseOptions = useMemo(() => {
    return (warehouses || []).map((w) => ({
      label: `${w.code} - ${w.name}`,
      value: w.id,
    }));
  }, [warehouses]);

  const productOptions = useMemo(() => {
    return ((productsData?.content || []) as ProductResponse[]).map((p) => ({
      label: `${p.name} (${p.code})`,
      value: p.id,
    }));
  }, [productsData]);

  const ensureVariantsLoaded = async (productId: number) => {
    if (!productId) return;
    if (variantsByProduct[productId]) return;

    setVariantsLoadingByProduct((prev) => ({ ...prev, [productId]: true }));
    try {
      const variants = await getVariantsByProductId(productId);
      setVariantsByProduct((prev) => ({ ...prev, [productId]: variants }));
    } catch {
      message.error('No se pudieron cargar las variantes del producto');
    } finally {
      setVariantsLoadingByProduct((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!user?.userId) {
      message.error('No se pudo identificar al usuario autenticado');
      return;
    }

    const request: CreatePurchaseRequest = {
      supplierId: values.supplierId,
      warehouseId: values.warehouseId,
      userId: user.userId,
      invoiceType: values.invoiceType,
      invoiceNumber: values.invoiceNumber,
      purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : undefined,
      notes: values.notes,
      items: (values.items || []).map((item: { variantId: number; quantity: number; unitCost: number }) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };

    await createPurchase.mutateAsync(request);
    onCancel();
  };

  return (
    <Modal
      title="Crear Compra"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      afterOpenChange={(isOpen) => {
        if (!isOpen) return;
        form.resetFields();
        setSupplierSearch('');
        setProductSearch('');
      }}
      okText="Crear"
      cancelText="Cancelar"
      width={1000}
      confirmLoading={createPurchase.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          items: [{ productId: undefined, variantId: undefined, quantity: 1, unitCost: undefined }],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Proveedor"
              name="supplierId"
              rules={[{ required: true, message: 'Seleccione un proveedor' }]}
            >
              <Select
                placeholder="Buscar y seleccionar proveedor"
                showSearch
                filterOption={false}
                onSearch={setSupplierSearch}
                options={supplierOptions}
                loading={isLoadingSuppliers}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Almacén"
              name="warehouseId"
              rules={[{ required: true, message: 'Seleccione un almacén' }]}
            >
              <Select
                placeholder="Seleccione almacén"
                options={warehouseOptions}
                loading={isLoadingWarehouses}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de comprobante"
              name="invoiceType"
              rules={[{ required: true, message: 'Seleccione el tipo de comprobante' }]}
            >
              <Select
                placeholder="Seleccione"
                options={[
                  { value: 'BILL', label: 'Boleta' },
                  { value: 'INVOICE', label: 'Factura' },
                  { value: 'CREDIT_NOTE', label: 'Nota de crédito' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Número de comprobante"
              name="invoiceNumber"
              rules={[{ required: true, message: 'Ingrese el número de comprobante' }]}
            >
              <Input placeholder="Ej: F001-000123" maxLength={50} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Fecha de compra" name="purchaseDate">
              <DatePicker style={{ width: '100%' }} placeholder="Seleccione" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Notas" name="notes">
              <Input.TextArea placeholder="Observaciones..." rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.List
          name="items"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  throw new Error('Agregue al menos un ítem');
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Ítems</div>
                <Button
                  type="dashed"
                  icon={<IconPlus size={16} />}
                  onClick={() => add({ productId: undefined, variantId: undefined, quantity: 1, unitCost: undefined })}
                >
                  Agregar ítem
                </Button>
              </div>

              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={7}>
                    <Form.Item
                      {...restField}
                      label="Producto"
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Seleccione un producto' }]}
                    >
                      <Select
                        placeholder="Buscar y seleccionar producto"
                        showSearch
                        filterOption={false}
                        onSearch={setProductSearch}
                        options={productOptions}
                        loading={isLoadingProducts}
                        allowClear
                        onChange={async (productId) => {
                          form.setFieldValue(['items', name, 'variantId'], undefined);
                          if (typeof productId === 'number') {
                            await ensureVariantsLoaded(productId);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={7}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, cur) => prev?.items?.[name]?.productId !== cur?.items?.[name]?.productId}
                    >
                      {() => {
                        const productId = form.getFieldValue(['items', name, 'productId']) as number | undefined;
                        const variants = productId ? variantsByProduct[productId] : undefined;
                        const isLoadingVariants = productId ? !!variantsLoadingByProduct[productId] : false;

                        return (
                          <Form.Item
                            {...restField}
                            label="Variante (SKU)"
                            name={[name, 'variantId']}
                            rules={[{ required: true, message: 'Seleccione una variante' }]}
                          >
                            <Select
                              placeholder={productId ? 'Seleccionar SKU' : 'Seleccione producto primero'}
                              disabled={!productId}
                              loading={isLoadingVariants}
                              showSearch
                              optionFilterProp="label"
                              options={(variants || []).map((v) => ({ label: v.sku, value: v.id }))}
                              allowClear
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      label="Cantidad"
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Ingrese la cantidad' }]}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} placeholder="1" />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      label="Costo Unitario "
                      name={[name, 'unitCost']}
                      rules={[{ required: true, message: 'Ingrese el costo unitario' }]}
                    >
                      <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.00" />
                    </Form.Item>
                  </Col>

                  <Col span={2}>
                    <Space>
                      <Button
                        type="link"
                        danger
                        icon={<IconTrash size={16} />}
                        onClick={() => remove(name)}
                        title="Eliminar ítem"
                      />
                    </Space>
                  </Col>
                </Row>
              ))}

              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
