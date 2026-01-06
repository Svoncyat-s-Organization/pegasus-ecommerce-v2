import { Alert, Form, Input, Modal, Select, Switch } from 'antd';
import { useMemo } from 'react';
import type {
  InspectItemRequest,
  ItemCondition,
  RmaItemResponse,
  RmaResponse,
} from '@types';
import { ITEM_CONDITION_LABELS } from '../constants/rmaConstants';

type InspectionFormValues = {
  items: Record<
    number,
    {
      itemCondition?: ItemCondition;
      inspectionNotes?: string;
      restockApproved?: boolean;
    }
  >;
};

interface InspectionModalProps {
  open: boolean;
  rma: RmaResponse;
  uninspectedItems: RmaItemResponse[];
  onClose: () => void;
  onInspectItem: (request: InspectItemRequest) => Promise<unknown>;
  isInspecting: boolean;
}

const canBeRestocked = (condition?: ItemCondition): boolean => {
  if (!condition) return false;
  return ['UNOPENED', 'OPENED_UNUSED', 'USED_LIKE_NEW'].includes(condition);
};

export const InspectionModal = ({
  open,
  rma,
  uninspectedItems,
  onClose,
  onInspectItem,
  isInspecting,
}: InspectionModalProps) => {
  const [form] = Form.useForm<InspectionFormValues>();

  const initialValues = useMemo<InspectionFormValues>(() => {
    const items = Object.fromEntries(
      uninspectedItems.map((i) => [
        i.id,
        {
          itemCondition: i.itemCondition,
          inspectionNotes: i.inspectionNotes,
          restockApproved: i.restockApproved ?? false,
        },
      ])
    );

    return { items };
  }, [uninspectedItems]);

  const handleOk = async () => {
    if (uninspectedItems.length === 0) {
      onClose();
      return;
    }

    try {
      const values = (await form.validateFields()) as InspectionFormValues;

      for (const item of uninspectedItems) {
        const payload = values.items[item.id];
        if (!payload?.itemCondition) continue;

        await onInspectItem({
          rmaItemId: item.id,
          itemCondition: payload.itemCondition,
          inspectionNotes: payload.inspectionNotes,
          restockApproved: payload.restockApproved ?? false,
        });
      }

      onClose();
      form.resetFields();
    } catch {
      // handled in form/hook
    }
  };

  return (
    <Modal
      title={`Inspección - RMA ${rma.rmaNumber}`}
      open={open}
      onOk={handleOk}
      okText="Guardar inspección"
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      confirmLoading={isInspecting}
      width={900}
    >
      {uninspectedItems.length === 0 ? (
        <Alert
          type="info"
          showIcon
          message="No hay items pendientes de inspección"
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          key={`${rma.id}-${uninspectedItems.length}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {uninspectedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    SKU: {item.variantSku} · Cantidad: {item.quantity}
                  </div>
                </div>

                <Form.Item
                  label="Condición"
                  name={['items', item.id, 'itemCondition']}
                  rules={[{ required: true, message: 'Seleccione la condición' }]}
                >
                  <Select
                    placeholder="Seleccione"
                    options={Object.entries(ITEM_CONDITION_LABELS).map(
                      ([value, label]) => ({
                        value,
                        label,
                      })
                    )}
                  />
                </Form.Item>

                <Form.Item label="Notas" name={['items', item.id, 'inspectionNotes']}>
                  <Input.TextArea rows={3} placeholder="Detalle (opcional)" />
                </Form.Item>

                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const condition = getFieldValue([
                      'items',
                      item.id,
                      'itemCondition',
                    ]) as ItemCondition | undefined;
                    const restockDisabled = !canBeRestocked(condition);

                    return (
                      <Form.Item
                        label="Aprobar reposición de stock"
                        name={['items', item.id, 'restockApproved']}
                        valuePropName="checked"
                      >
                        <Switch
                          disabled={restockDisabled}
                          checkedChildren="Sí"
                          unCheckedChildren="No"
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </div>
            ))}
          </div>
        </Form>
      )}
    </Modal>
  );
};
