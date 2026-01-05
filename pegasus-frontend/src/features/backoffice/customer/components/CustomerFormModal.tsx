import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col } from 'antd';
import { useCustomer } from '../hooks/useCustomers';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomerMutations';
import { DOCUMENT_TYPES, CUSTOMER_VALIDATION_RULES } from '../constants/customerConstants';
import type { CreateCustomerRequest, UpdateCustomerRequest, DocumentType } from '@types';

interface CustomerFormModalProps {
  mode: 'create' | 'edit';
  customerId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const CustomerFormModal = ({ mode, customerId, visible, onClose }: CustomerFormModalProps) => {
  const [form] = Form.useForm();
  const { data: customer } = useCustomer(customerId || 0, { enabled: mode === 'edit' && !!customerId });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  useEffect(() => {
    if (visible && mode === 'edit' && customer) {
      form.setFieldsValue({
        username: customer.username,
        email: customer.email,
        docType: customer.docType,
        docNumber: customer.docNumber,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || '',
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, mode, customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (mode === 'create') {
        await createMutation.mutateAsync(values as CreateCustomerRequest);
      } else if (customerId) {
        const updateData: UpdateCustomerRequest = {
          username: values.username,
          email: values.email,
          docType: values.docType,
          docNumber: values.docNumber,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
        };
        await updateMutation.mutateAsync({ id: customerId, data: updateData });
      }
      
      onClose();
    } catch {
      // Validation errors handled by form
    }
  };

  const validateDocNumber = (_rule: unknown, value: string) => {
    const docType = form.getFieldValue('docType') as DocumentType;
    
    if (!value) {
      return Promise.reject(new Error('El número de documento es requerido'));
    }
    
    if (docType === 'DNI') {
      if (!CUSTOMER_VALIDATION_RULES.dniPattern.test(value)) {
        return Promise.reject(new Error(CUSTOMER_VALIDATION_RULES.dniMessage));
      }
    } else if (docType === 'CE') {
      if (!CUSTOMER_VALIDATION_RULES.cePattern.test(value)) {
        return Promise.reject(new Error(CUSTOMER_VALIDATION_RULES.ceMessage));
      }
    }
    
    return Promise.resolve();
  };

  return (
    <Modal
      title={mode === 'create' ? 'Crear Cliente' : 'Editar Cliente'}
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
          {mode === 'create' ? 'Crear' : 'Guardar'}
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Usuario"
              name="username"
              rules={[
                { required: true, message: 'El usuario es requerido' },
                {
                  min: CUSTOMER_VALIDATION_RULES.usernameMin,
                  max: CUSTOMER_VALIDATION_RULES.usernameMax,
                  message: `Entre ${CUSTOMER_VALIDATION_RULES.usernameMin} y ${CUSTOMER_VALIDATION_RULES.usernameMax} caracteres`,
                },
              ]}
            >
              <Input placeholder="usuario123" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'El email es requerido' },
                { type: 'email', message: 'Email inválido' },
              ]}
            >
              <Input placeholder="cliente@ejemplo.com" />
            </Form.Item>
          </Col>
        </Row>

        {mode === 'create' && (
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: 'La contraseña es requerida' },
              {
                min: CUSTOMER_VALIDATION_RULES.passwordMin,
                message: `Mínimo ${CUSTOMER_VALIDATION_RULES.passwordMin} caracteres`,
              },
            ]}
          >
            <Input.Password placeholder="Ingrese la contraseña" />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre"
              name="firstName"
              rules={[
                { required: true, message: 'El nombre es requerido' },
                { max: CUSTOMER_VALIDATION_RULES.firstNameMax, message: 'Nombre muy largo' },
              ]}
            >
              <Input placeholder="Juan" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Apellido"
              name="lastName"
              rules={[
                { required: true, message: 'El apellido es requerido' },
                { max: CUSTOMER_VALIDATION_RULES.lastNameMax, message: 'Apellido muy largo' },
              ]}
            >
              <Input placeholder="Pérez" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de Documento"
              name="docType"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select
                placeholder="Tipo"
                options={DOCUMENT_TYPES.map((type) => ({ label: type.value, value: type.value }))}
                onChange={() => form.validateFields(['docNumber'])}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Número de Documento"
              name="docNumber"
              rules={[{ required: true, validator: validateDocNumber }]}
            >
              <Input placeholder="12345678" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[
                {
                  pattern: CUSTOMER_VALIDATION_RULES.phonePattern,
                  message: CUSTOMER_VALIDATION_RULES.phoneMessage,
                },
              ]}
            >
              <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
