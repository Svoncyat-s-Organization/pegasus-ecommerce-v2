import { useState } from 'react';
import { List, Button, Space, Tag, Typography, Empty, Popconfirm, Spin } from 'antd';
import { IconEdit, IconTrash, IconTruck, IconReceipt } from '@tabler/icons-react';
import { useCustomerAddresses } from '../hooks/useCustomers';
import {
  useDeleteAddress,
  useSetDefaultShipping,
  useSetDefaultBilling,
} from '../hooks/useCustomerMutations';
import { AddressFormModal } from './AddressFormModal';
import type { CustomerAddressResponse } from '@types';

const { Text } = Typography;

interface AddressListProps {
  customerId: number;
  addressModalVisible: boolean;
  onCloseAddressModal: () => void;
}

export const AddressList = ({ customerId, addressModalVisible, onCloseAddressModal }: AddressListProps) => {
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: addresses, isLoading } = useCustomerAddresses(customerId);
  const deleteAddress = useDeleteAddress();
  const setDefaultShipping = useSetDefaultShipping();
  const setDefaultBilling = useSetDefaultBilling();

  const handleEdit = (addressId: number) => {
    setEditingAddressId(addressId);
    setFormMode('edit');
  };

  const handleDelete = (addressId: number) => {
    deleteAddress.mutate({ customerId, addressId });
  };

  const handleSetDefaultShipping = (addressId: number) => {
    setDefaultShipping.mutate({ customerId, addressId });
  };

  const handleSetDefaultBilling = (addressId: number) => {
    setDefaultBilling.mutate({ customerId, addressId });
  };

  const handleCloseModal = () => {
    setEditingAddressId(null);
    setFormMode('create');
    onCloseAddressModal();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin />
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <>
        <Empty description="No hay direcciones registradas" />
        <AddressFormModal
          mode={formMode}
          customerId={customerId}
          addressId={editingAddressId}
          visible={addressModalVisible || !!editingAddressId}
          onClose={handleCloseModal}
        />
      </>
    );
  }

  return (
    <>
      <List
        dataSource={addresses}
        renderItem={(address: CustomerAddressResponse) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                type="link"
                size="small"
                icon={<IconEdit size={16} />}
                onClick={() => handleEdit(address.id)}
              />,
              <Popconfirm
                key="delete"
                title="¿Eliminar dirección?"
                description="Esta acción no se puede deshacer"
                onConfirm={() => handleDelete(address.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button type="link" danger size="small" icon={<IconTrash size={16} />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{address.address}</Text>
                  {address.isDefaultShipping && (
                    <Tag icon={<IconTruck size={12} />} color="blue">
                      Envío
                    </Tag>
                  )}
                  {address.isDefaultBilling && (
                    <Tag icon={<IconReceipt size={12} />} color="green">
                      Facturación
                    </Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  {address.reference && <Text type="secondary">Ref: {address.reference}</Text>}
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ubigeo: {address.ubigeoId}
                    {address.postalCode && ` | Código Postal: ${address.postalCode}`}
                  </Text>
                  <br />
                  <Space size="small" style={{ marginTop: 4 }}>
                    {!address.isDefaultShipping && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleSetDefaultShipping(address.id)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Marcar como envío
                      </Button>
                    )}
                    {!address.isDefaultBilling && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleSetDefaultBilling(address.id)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Marcar como facturación
                      </Button>
                    )}
                  </Space>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <AddressFormModal
        mode={formMode}
        customerId={customerId}
        addressId={editingAddressId}
        visible={addressModalVisible || !!editingAddressId}
        onClose={handleCloseModal}
      />
    </>
  );
};
