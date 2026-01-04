import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, Row, Col, Select } from 'antd';
import { useCustomerAddresses } from '../hooks/useCustomers';
import { useCreateAddress, useUpdateAddress } from '../hooks/useCustomerMutations';
import { ADDRESS_VALIDATION_RULES } from '../constants/customerConstants';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import type { CreateCustomerAddressRequest, UpdateCustomerAddressRequest } from '@types';

interface AddressFormModalProps {
  mode: 'create' | 'edit';
  customerId: number;
  addressId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const AddressFormModal = ({ mode, customerId, addressId, visible, onClose }: AddressFormModalProps) => {
  const [form] = Form.useForm();
  const { data: addresses } = useCustomerAddresses(customerId);
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();

  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>();
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();

  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: provinces, isLoading: loadingProvinces } = useProvinces(selectedDepartment);
  const { data: districts, isLoading: loadingDistricts } = useDistricts(selectedProvince);

  const currentAddress = addresses?.find((addr) => addr.id === addressId);

  useEffect(() => {
    if (visible && mode === 'edit' && currentAddress) {
      // En modo edición, extraer departamento y provincia del ubigeoId
      const ubigeoId = currentAddress.ubigeoId;
      const departmentId = ubigeoId.substring(0, 2);
      const provinceId = ubigeoId.substring(0, 4);
      
      setSelectedDepartment(departmentId);
      setSelectedProvince(provinceId);
      
      form.setFieldsValue({
        department: departmentId,
        province: provinceId,
        district: ubigeoId,
        address: currentAddress.address,
        reference: currentAddress.reference || '',
        postalCode: currentAddress.postalCode || '',
        isDefaultShipping: currentAddress.isDefaultShipping,
        isDefaultBilling: currentAddress.isDefaultBilling,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
      setSelectedDepartment(undefined);
      setSelectedProvince(undefined);
      form.setFieldsValue({
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
    }
  }, [visible, mode, currentAddress, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (mode === 'create') {
        const createData: CreateCustomerAddressRequest = {
          ubigeoId: values.district, // El distrito contiene el ubigeoId completo (6 dígitos)
          address: values.address,
          reference: values.reference || undefined,
          postalCode: values.postalCode || undefined,
          isDefaultShipping: values.isDefaultShipping || false,
          isDefaultBilling: values.isDefaultBilling || false,
        };
        await createMutation.mutateAsync({ customerId, data: createData });
      } else if (addressId) {
        const updateData: UpdateCustomerAddressRequest = {
          ubigeoId: values.district,
          address: values.address,
          reference: values.reference || undefined,
          postalCode: values.postalCode || undefined,
        };
        await updateMutation.mutateAsync({ customerId, addressId, data: updateData });
      }

      onClose();
    } catch (error) {
      // Validation errors handled by form
    }
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedProvince(undefined);
    form.setFieldsValue({ province: undefined, district: undefined });
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    form.setFieldsValue({ district: undefined });
  };

  return (
    <Modal
      title={mode === 'create' ? 'Agregar Dirección' : 'Editar Dirección'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createMutation.isPending || updateMutation.isPending}
          onClick={handleSubmit}
        >
          {mode === 'create' ? 'Agregar' : 'Guardar'}
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Departamento"
              name="department"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select
                placeholder="Seleccione"
                loading={loadingDepartments}
                options={departments?.map((dept) => ({ label: dept.name, value: dept.id }))}
                onChange={handleDepartmentChange}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Provincia"
              name="province"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select
                placeholder="Seleccione"
                loading={loadingProvinces}
                disabled={!selectedDepartment}
                options={provinces?.map((prov) => ({ label: prov.name, value: prov.id }))}
                onChange={handleProvinceChange}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Distrito"
              name="district"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select
                placeholder="Seleccione"
                loading={loadingDistricts}
                disabled={!selectedProvince}
                options={districts?.map((dist) => ({ label: dist.name, value: dist.id }))}
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
            {
              max: ADDRESS_VALIDATION_RULES.maxAddressLength,
              message: `Máximo ${ADDRESS_VALIDATION_RULES.maxAddressLength} caracteres`,
            },
          ]}
        >
          <Input placeholder="Av. Principal 123, Miraflores" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="Referencia" name="reference">
              <Input placeholder="Frente al parque, edificio azul" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Código Postal"
              name="postalCode"
              rules={[
                {
                  max: ADDRESS_VALIDATION_RULES.maxPostalCodeLength,
                  message: 'Código muy largo',
                },
              ]}
            >
              <Input placeholder="15074" />
            </Form.Item>
          </Col>
        </Row>

        {mode === 'create' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Dirección de Envío por Defecto" name="isDefaultShipping" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Dirección de Facturación por Defecto" name="isDefaultBilling" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};
