import { HStack, Text, Button, Flex, Icon } from '@chakra-ui/react';
import { LogOut, Activity } from 'lucide-react'; // Ho aggiunto Activity come esempio di logo icon

export default function Navbar({ currentUser, onLogout }) {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      bg="var(--color-navbar)"
      px={5}
      py={3}
      borderRadius="xl" 
      border="1px solid"
      borderColor="var(--color-border)"
      boxShadow="sm"
      mb={6}>

      <HStack spacing={2} color="var(--color-primary-blue)">
        <Icon as={Activity} boxSize={5} strokeWidth={2.5} />
        <Text fontWeight="bold" fontSize="lg" letterSpacing="tight" color="var(--color-text-main)">
          Smart Workflow Engine
        </Text>
      </HStack>

      <HStack spacing={4}>
        <Text fontSize="sm" color="var(--color-text-muted)" fontWeight="medium">
          Utente: <Text as="span" fontWeight="bold" color="var(--color-text-main)">{currentUser.username}</Text>
        </Text>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onLogout}
          color="var(--color-danger)"
          _hover={{
            bg: "red.50",
            transform: "translateY(-1px)",
          }}
          _active={{
            bg: "red.100",
          }}
          transition="all 0.2s"
          leftIcon={<LogOut size={16} />} >
          Logout
        </Button>
      </HStack>
    </Flex>
  );
}
