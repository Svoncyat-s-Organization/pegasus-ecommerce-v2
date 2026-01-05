import { Modal, Form, Input, Row, Col, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { WarehouseResponse, CreateWarehouseRequest, UpdateWarehouseRequest } from '@types';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';

interface WarehouseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateWarehouseRequest | UpdateWarehouseRequest) => Promise<void>;
  initialValues?: WarehouseResponse | null;
  loading: boolean;
}

export const WarehouseFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: WarehouseFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        code: initialValues.code,
        name: initialValues.name,
        ubigeoId: initialValues.ubigeoId,
        address: initialValues.address,
      });
    } else if (open && !initialValues) {
      form.resetFields();
      setSelectedDepartment(undefined);
      setSelectedProvince(undefined);
    }
  }, [open, initialValues, form]);

  const handleFormSubmit = async (values: CreateWarehouseRequest | UpdateWarehouseRequest) => {
    await onSubmit(values);
    form.resetFields();
    setSelectedDepartment(undefined);
    setSelectedProvince(undefined);
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Editar Almacén' : 'Crear Almacén'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Código"
              name="code"
              rules={[
                { required: true, message: 'El código es requerido' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Input placeholder="WH-001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[
                { required: true, message: 'El nombre es requerido' },
                { max: 100, message: 'Máximo 100 caracteres' },
              ]}
            >
              <Input placeholder="Almacén Principal" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Departamento" rules={[{ required: true }]}>
              <Select
                placeholder="Seleccione departamento"
                value={selectedDepartment}
                onChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedProvince(undefined);
                  form.setFieldsValue({ province: undefined, ubigeoId: undefined });
                }}
                options={departments?.map((dept) => ({
                  label: dept.name,
                  value: dept.id,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Provincia" rules={[{ required: true }]}>
              <Select
                placeholder="Seleccione provincia"
                value={selectedProvince}
                onChange={(value) => {
                  setSelectedProvince(value);
                  form.setFieldsValue({ ubigeoId: undefined });
                }}
                disabled={!selectedDepartment}
                options={provinces?.map((prov) => ({
                  label: prov.name,
                  value: prov.id,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Distrito"
              name="ubigeoId"
              rules={[
                { required: true, message: 'El distrito es requerido' },
              ]}
            >
              <Select
                placeholder="Seleccione distrito"
                disabled={!selectedProvince}
                options={districts?.map((dist) => ({
                  label: dist.name,
                  value: dist.id,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[
            { required: true, message: 'La dirección es requerida' },
            { max: 255, message: 'Máximo 255 caracteres' },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Av. Industrial 123, Zona Industrial" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
