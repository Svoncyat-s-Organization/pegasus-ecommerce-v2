import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { UserForm } from '../components/UserForm';
import { useUser } from '../hooks/useUsers';
import { useUpdateUser } from '../hooks/useUserMutations';
import type { UpdateUserRequest } from '@types';

export const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading: loadingUser } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = (values: UpdateUserRequest) => {
    updateUser.mutate(
      { id: userId, userData: values },
      {
        onSuccess: () => {
          navigate('/admin/security/users');
        },
      }
    );
  };

  if (loadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <UserForm
      mode="edit"
      initialValues={user}
      onSubmit={handleSubmit}
      isLoading={updateUser.isPending}
    />
  );
};
