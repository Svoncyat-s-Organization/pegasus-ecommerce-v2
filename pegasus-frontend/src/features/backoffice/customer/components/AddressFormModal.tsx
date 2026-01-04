import { useEffect } from 'react';
import { Modal, Form, Input, Switch, Button, Row, Col } from 'antd';
import { useCustomerAddresses } from '../hooks/useCustomers';
import { useCreateAddress, useUpdateAddress } from '../hooks/useCustomerMutations';
import { ADDRESS_VALIDATION_RULES } from '../constants/customerConstants';
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

  const currentAddress = addresses?.find((addr) => addr.id === addressId);

  useEffect(() => {
    if (visible && mode === 'edit' && currentAddress) {
      form.setFieldsValue({
        ubigeoId: currentAddress.ubigeoId,
        address: currentAddress.address,
        reference: currentAddress.reference || '',
        postalCode: currentAddress.postalCode || '',
        isDefaultShipping: currentAddress.isDefaultShipping,
        isDefaultBilling: currentAddress.isDefaultBilling,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
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
          ubigeoId: values.ubigeoId,
          address: values.address,
          reference: values.reference || undefined,
          postalCode: values.postalCode || undefined,
          isDefaultShipping: values.isDefaultShipping || false,
          isDefaultBilling: values.isDefaultBilling || false,
        };
        await createMutation.mutateAsync({ customerId, data: createData });
      } else if (addressId) {
        const updateData: UpdateCustomerAddressRequest = {
          ubigeoId: values.ubigeoId,
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
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Ubigeo"
          name="ubigeoId"
          rules={[
            { required: true, message: 'El ubigeo es requerido' },
            {
              pattern: ADDRESS_VALIDATION_RULES.ubigeoPattern,
              message: ADDRESS_VALIDATION_RULES.ubigeoMessage,
            },
          ]}
          tooltip="Código de ubigeo de 6 dígitos (departamento-provincia-distrito)"
        >
          <Input placeholder="150101" maxLength={6} />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[
            { required: true, message: 'La dirección es requerida' },
            {
              max: ADDRESS_VALIDATION_RULES.maxAddressLength,
              message: `La dirección no puede exceder ${ADDRESS_VALIDATION_RULES.maxAddressLength} caracteres`,
            },
          ]}
        >
          <Input placeholder="Av. Principal 123, Miraflores" />
        </Form.Item>

        <Form.Item label="Referencia" name="reference">
          <Input.TextArea rows={2} placeholder="Frente al parque, edificio azul, piso 3" />
        </Form.Item>

        <Form.Item
          label="Código Postal"
          name="postalCode"
          rules={[
            {
              max: ADDRESS_VALIDATION_RULES.maxPostalCodeLength,
              message: `Código postal muy largo`,
            },
          ]}
        >
          <Input placeholder="15074" />
        </Form.Item>

        {mode === 'create' && (
          <>
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
          </>
        )}
      </Form>
    </Modal>
  );
};
