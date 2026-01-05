import { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Row, Col, Select } from 'antd';
import type { CreateSupplierRequest, SupplierDocumentType, UpdateSupplierRequest } from '@types';
import { useDepartments, useDistricts, useProvinces } from '@shared/hooks/useLocations';
import { useSupplierById } from '../hooks/useSuppliers';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSupplierMutations';

const { Option } = Select;

interface SupplierFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  supplierId: number | null;
  onCancel: () => void;
}

type SupplierFormValues = CreateSupplierRequest & {
  departmentId?: string;
  provinceId?: string;
};

const isValidSupplierDoc = (docType: SupplierDocumentType, docNumber: string): boolean => {
  const cleaned = (docNumber || '').trim();
  if (docType === 'DNI') return /^\d{8}$/.test(cleaned);
  if (docType === 'RUC') return /^\d{11}$/.test(cleaned);
  return false;
};

export const SupplierFormModal = ({ open, mode, supplierId, onCancel }: SupplierFormModalProps) => {
  const [form] = Form.useForm<SupplierFormValues>();

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplierById(mode === 'edit' ? supplierId : null);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const selectedDepartment = Form.useWatch('departmentId', form) as string | undefined;
  const selectedProvince = Form.useWatch('provinceId', form) as string | undefined;

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  const isSubmitting = createSupplier.isPending || updateSupplier.isPending;

  const modalTitle = useMemo(() => (mode === 'edit' ? 'Editar Proveedor' : 'Crear Proveedor'), [mode]);
  const okText = useMemo(() => (mode === 'edit' ? 'Actualizar' : 'Crear'), [mode]);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && supplier) {
      const ubigeoId = supplier.ubigeoId;
      const departmentId = ubigeoId?.slice(0, 2);
      const provinceId = ubigeoId?.slice(0, 4);

      form.setFieldsValue({
        docType: supplier.docType,
        docNumber: supplier.docNumber,
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        departmentId,
        provinceId,
        ubigeoId: supplier.ubigeoId,
      });

      return;
    }

    if (mode === 'create') {
      form.resetFields();
    }
  }, [open, mode, supplier, form]);

  const handleDepartmentChange = (value: string) => {
    form.setFieldsValue({ departmentId: value, provinceId: undefined, ubigeoId: undefined });
  };

  const handleProvinceChange = (value: string) => {
    form.setFieldsValue({ provinceId: value, ubigeoId: undefined });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    // Remove helper fields used only for cascading ubigeo selection
    const { departmentId: _departmentId, provinceId: _provinceId, ...payload } = values as SupplierFormValues;
    void _departmentId;
    void _provinceId;

    // Clean phone number (remove spaces)
    if (payload.phone) {
      payload.phone = payload.phone.replace(/\s/g, '');
    }

    if (mode === 'create') {
      await createSupplier.mutateAsync(payload);
      onCancel();
      return;
    }

    if (!supplierId) return;

    const request: UpdateSupplierRequest = { ...payload };
    await updateSupplier.mutateAsync({ id: supplierId, request });
    onCancel();
  };

  return (
    <Modal
      title={modalTitle}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={okText}
      cancelText="Cancelar"
      width={900}
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: mode === 'edit' && isLoadingSupplier }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de documento"
              name="docType"
              rules={[{ required: true, message: 'Seleccione el tipo de documento' }]}
            >
              <Select placeholder="Seleccione" disabled={mode === 'edit' && isLoadingSupplier}>
                <Option value="DNI">DNI</Option>
                <Option value="RUC">RUC</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              label="Número de documento"
              name="docNumber"
              dependencies={['docType']}
              rules={[
                { required: true, message: 'Ingrese el número de documento' },
                ({ getFieldValue }) => ({
                  validator: async (_, value: string) => {
                    const docType = getFieldValue('docType') as SupplierDocumentType | undefined;
                    if (!docType || !value) return;

                    if (!isValidSupplierDoc(docType, value)) {
                      throw new Error(
                        docType === 'DNI'
                          ? 'DNI debe tener 8 dígitos'
                          : 'RUC debe tener 11 dígitos'
                      );
                    }
                  },
                }),
              ]}
            >
              <Input
                placeholder={
                  (Form.useWatch('docType', form) === 'DNI')
                    ? 'Ej: 12345678'
                    : 'Ej: 20123456789'
                }
                maxLength={
                  (Form.useWatch('docType', form) === 'DNI') ? 8 : 11
                }
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Razón social"
              name="companyName"
              rules={[{ required: true, message: 'Ingrese la razón social' }]}
            >
              <Input placeholder="Ej: Proveedor SAC" maxLength={150} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nombre de contacto" name="contactName">
              <Input placeholder="Ej: Juan Pérez" maxLength={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Teléfono" name="phone">
              <Input
                placeholder="Ej: 987 654 321"
                maxLength={11}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = '';
                  for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 3 === 0) {
                      formatted += ' ';
                    }
                    formatted += value[i];
                  }
                  form.setFieldsValue({ phone: formatted });
                }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email inválido' }]}>
              <Input placeholder="correo@dominio.com" maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Dirección" name="address">
              <Input placeholder="Av./Jr./Calle..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Departamento" name="departmentId">
              <Select
                placeholder="Seleccione"
                onChange={handleDepartmentChange}
                options={(departments || []).map((d) => ({ label: d.name, value: d.id }))}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Provincia" name="provinceId">
              <Select
                placeholder="Seleccione"
                onChange={handleProvinceChange}
                options={(provinces || []).map((p) => ({ label: p.name, value: p.id }))}
                disabled={!selectedDepartment}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Distrito" name="ubigeoId">
              <Select
                placeholder="Seleccione"
                options={(districts || []).map((d) => ({ label: d.name, value: d.id }))}
                disabled={!selectedProvince}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
