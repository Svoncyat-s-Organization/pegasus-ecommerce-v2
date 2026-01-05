import { Container, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <Container size="sm" py={60}>
      <Center>
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
      </Center>
    </Container>
  );
};
