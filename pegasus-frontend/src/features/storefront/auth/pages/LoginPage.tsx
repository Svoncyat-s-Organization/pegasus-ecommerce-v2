import { Container, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <Container size="xs" py={60}>
      <Center>
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      </Center>
    </Container>
  );
};
