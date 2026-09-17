import { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text } from '@chakra-ui/react';
import { LogIn } from 'lucide-react';
import { loginUser } from '../api/workflowApi';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('maria.giudice');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(username);
      onLoginSuccess(user);
    } catch (err) {
      setError('Utente non valido."');
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={8} bg="white" borderRadius="2xl" boxShadow="md">
      <VStack gap={4} align="stretch">
        <Heading size="md" textAlign="center">Accedi al Sistema</Heading>

        {error && <Text color="var(--color-danger)" fontSize="sm">{error}</Text>}

        <form onSubmit={handleLogin}>
          <VStack gap={4}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} />
            <Button type="submit" colorPalette="blue" width="full">
              <LogIn size={18} /> Accedi
            </Button>
          </VStack>
        </form>

        <Box pt={4} fontSize="xs" color="gray.500">
          <Text fontWeight="bold">Utenti Demo:</Text>
          <Text>• Dipendente: mariar.jud</Text>
          <Text>• Manager: mario.rossi</Text>
        </Box>
      </VStack>
    </Box>
  );
}