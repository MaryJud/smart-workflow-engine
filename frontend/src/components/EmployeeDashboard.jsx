import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Table,
} from '@chakra-ui/react';
import { toaster } from './ui/toaster';
import { Plus, Send, Receipt, CheckCircle2 } from 'lucide-react';
import { startExpenseWorkflow, submitExpenseDetails } from '../api/workflowApi';

export default function EmployeeDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeJobKey, setActiveJobKey] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Trasporti & Viaggi',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  // Clic sul bottone "Nuova Richiesta" -> Avvia il Processo Camunda
  const handleStartNewRequest = async () => {
    try {
      const res = await startExpenseWorkflow(user.username);
      setActiveJobKey(res.processInstanceKey); 
      setIsFormOpen(true);

      toaster.create({
        title: 'Workflow Avviato',
        description: `Bozza creata con successo (ID Istanza: ${res.processInstanceKey})`,
        type: 'info',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (err) {
      toaster.create({
        title: 'Errore Camunda',
        description: "Impossibile avviare il workflow. Verifica i log del backend.",
        type: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Invio del form -> Completa lo User Task "Compilazione Dettagli spesa"
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    try {
      // Invia direttamente processInstanceKey senza chiedere il jobKey all'utente
      await submitExpenseDetails({
        processInstanceKey: activeProcessInstanceKey,
        variables: formData
      });

      toaster.create({
        title: 'Task Completato',
        description: 'La richiesta di spesa è stata inviata al Manager.',
        type: 'success',
        duration: 5000,
      });
      setIsFormOpen(false);
    } catch (err) {
      toaster.create({
        title: 'Errore invio Task',
        description: 'Impossibile completare il task automaticamente.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between" bg="white" p={6} borderRadius="2xl" boxShadow="sm">
        <Box>
          <Heading size="md">{user.fullName}</Heading>
          <Text color="var(--color-text-main)" fontSize="sm">Ruolo: Dipendente</Text>
        </Box>
        <Button colorPalette="blue" onClick={handleStartNewRequest}>
          <Plus size={18} /> Nuova Richiesta Spesa
        </Button>
      </HStack>

      {isFormOpen && (
        <Box p={6} bg="white" borderRadius="2xl" borderWidth="2px" borderColor="blue.400" boxShadow="md">
          <Heading size="sm" mb={4} color="var(--color-primary-blue)">
            Task: Compilazione Dettagli Spesa
          </Heading>

          <form onSubmit={handleSubmitDetails}>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Importo (€)</Text>
                <Input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}  />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Categoria</Text>
                <select
                  className="custom-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Trasporti & Viaggi">Trasporti & Viaggi</option>
                  <option value="Vitto & Alloggio">Vitto & Alloggio</option>
                  <option value="Materiale d'ufficio">Materiale d'ufficio</option>
                </select>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Descrizione</Text>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Box>

              <HStack gap={2}>
                <Button type="submit" colorPalette="blue" flex="1">
                  <Send size={18} /> Conferma e Completa Task
                </Button>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Annulla
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      )}

      <Box p={6} bg="white" borderRadius="2xl" boxShadow="sm">
        <Heading size="sm" mb={4}>Le Tue Richieste Spese</Heading>
        {requests.length === 0 ? (
          <Text color="var(--color-text-main)" fontSize="sm">Nessuna richiesta inviata al momento.</Text>
        ) : (
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID Task</Table.ColumnHeader>
                <Table.ColumnHeader>Importo</Table.ColumnHeader>
                <Table.ColumnHeader>Categoria</Table.ColumnHeader>
                <Table.ColumnHeader>Data</Table.ColumnHeader>
                <Table.ColumnHeader>Stato</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((r, i) => (
                <Table.Row key={i}>
                  <Table.Cell>{r.id}</Table.Cell>
                  <Table.Cell>€{r.amount}</Table.Cell>
                  <Table.Cell>{r.category}</Table.Cell>
                  <Table.Cell>{r.date}</Table.Cell>
                  <Table.Cell><Badge colorPalette="purple">{r.status}</Badge></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </VStack>
  );
}