import { useState } from 'react';
import { Box, Container, Button, HStack, Text } from '@chakra-ui/react';
import { LogOut } from 'lucide-react';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import TaskManager from './components/TaskManager';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return (
      <Box minH="100vh" bg="var(--background-color)" py={10}>
        <Toaster />
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="var(--background-color)" py={2} px={1}>
      <Navbar currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      <Toaster />
      <Container maxW="100vh" maxH="100vw" p={2} borderRadius="md" boxShadow="md">
        {currentUser.role === 'EMPLOYEE' ? (
          <EmployeeDashboard user={currentUser} />
        ) : (
          <TaskManager user={currentUser} />
        )}
      </Container>
    </Box>
  );
}

export default App;