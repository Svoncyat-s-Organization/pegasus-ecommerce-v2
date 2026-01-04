import { useNavigate } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUserMutations';
import type { CreateUserRequest, UpdateUserRequest } from '@types';

export const UserCreatePage = () => {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const handleSubmit = (values: CreateUserRequest | UpdateUserRequest) => {
    createUser.mutate(values as CreateUserRequest, {
      onSuccess: () => {
        navigate('/admin/security/users');
      },
    });
  };

  return (
    <UserForm
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createUser.isPending}
    />
  );
};
