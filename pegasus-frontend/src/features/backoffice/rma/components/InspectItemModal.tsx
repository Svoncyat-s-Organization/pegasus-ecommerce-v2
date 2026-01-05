import { Modal, Form, Select, Input, Button, Switch, Alert } from 'antd';
import { useState, useEffect } from 'react';
import type { RmaItemResponse, ItemCondition } from '@types';
import { ITEM_CONDITION_LABELS } from '../constants/rmaConstants';
import { useRmaMutations } from '../hooks/useRmaMutations';

const { TextArea } = Input;

interface InspectItemModalProps {
  item: RmaItemResponse | null;
  open: boolean;
  onClose: () => void;
}

export const InspectItemModal = ({ item, open, onClose }: InspectItemModalProps) => {
  const [form] = Form.useForm();
  const { inspectItem, isInspecting } = useRmaMutations();
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | null>(null);

  useEffect(() => {
    if (item && open) {
      form.setFieldsValue({
        itemCondition: item.itemCondition,
        inspectionNotes: item.inspectionNotes,
        restockApproved: item.restockApproved ?? false,
      });
      setSelectedCondition(item.itemCondition || null);
    }
  }, [item, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (item) {
        await inspectItem({
          rmaItemId: item.id,
          itemCondition: values.itemCondition,
          inspectionNotes: values.inspectionNotes,
          restockApproved: values.restockApproved,
        });
        form.resetFields();
        onClose();
      }
    } catch (error) {
      // Form validation error or mutation error (handled in hook)
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCondition(null);
    onClose();
  };

  const canRestock = (condition: ItemCondition): boolean => {
    return ['UNOPENED', 'OPENED_UNUSED', 'USED_LIKE_NEW'].includes(condition);
  };

  return (
    <Modal
      title="Inspeccionar Item"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isInspecting}
          onClick={handleSubmit}
        >
          Guardar Inspección
        </Button>,
      ]}
    >
      {item && (
        <>
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <strong>Producto:</strong> {item.productName}
            <br />
            <strong>SKU:</strong> {item.variantSku}
            <br />
            <strong>Cantidad:</strong> {item.quantity}
          </div>

          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Condición del Item"
              name="itemCondition"
              rules={[{ required: true, message: 'Seleccione la condición' }]}
            >
              <Select
                placeholder="Seleccione la condición"
                onChange={(value) => setSelectedCondition(value)}
                options={Object.entries(ITEM_CONDITION_LABELS).map(([value, label]) => ({
                  label,
                  value,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Notas de Inspección"
              name="inspectionNotes"
            >
              <TextArea
                rows={4}
                placeholder="Detalles sobre la inspección del item..."
              />
            </Form.Item>

            <Form.Item
              label="Aprobar para Restock"
              name="restockApproved"
              valuePropName="checked"
            >
              <Switch
                disabled={!selectedCondition || !canRestock(selectedCondition)}
                checkedChildren="Sí"
                unCheckedChildren="No"
              />
            </Form.Item>

            {selectedCondition && !canRestock(selectedCondition) && (
              <Alert
                message="Advertencia"
                description="Items en esta condición generalmente no se restock automáticamente."
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Form>
        </>
      )}
    </Modal>
  );
};
