import { useState, useEffect } from 'react';
import { Box, Button, Textarea, VStack, HStack, Heading, Text, Badge, Spinner} from '@chakra-ui/react';
import { ShieldCheck, CheckCircle2, XCircle, MessageSquare, Check, X,
  AlertCircle, RefreshCw, Clock, User, DollarSign, Calendar, FileText} from 'lucide-react';
import { getPendingRequests, completeApprovalTask } from '../api/workflowApi';

export default function TaskManager() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approved, setApproved] = useState('true');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Carica le richieste in attesa di approvazione
  const loadPendingRequests = async () => {
    setLoadingList(true);
    try {
      const data = await getPendingRequests();
      setPendingRequests(data || []);
      // Se la richiesta selezionata non è più nella lista, resetta la selezione
      if (selectedRequest && !data.some(r => r.processInstanceKey === selectedRequest.processInstanceKey)) {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Errore nel caricamento delle richieste pendenti:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    setStatus(null);

    try {
      await completeApprovalTask({
        processInstanceKey: selectedRequest.processInstanceKey,
        variables: {
          approved: approved === 'true',
          notes: notes,
        },
      });

      setStatus({
        type: 'success',
        msg: `Richiesta #${selectedRequest.id} di ${selectedRequest.employeeUsername} valutata con esito: ${
          approved === 'true' ? 'APPROVATA' : 'RIFIUTATA'
        }`,
      });

      setSelectedRequest(null);
      setNotes('');
      setApproved('true');
      await loadPendingRequests();
    } catch (err) {
      setStatus({
        type: 'error',
        msg: 'Impossibile completare il task. Verifica la connessione con il server.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="cardBox">
      {/* Header */}
      <HStack justify="space-between" align="center" mb={6}>
        <HStack gap={2}>
          <ShieldCheck size={22} color="var(--color-primary-purple)" />
          <Heading as="h2" size="md" color="var(--color-text-main)">
            Valutazione Manager
          </Heading>
        </HStack>
        <Button
          size="xs"
          variant="ghost"
          onClick={loadPendingRequests}
          loading={loadingList}
        >
          <RefreshCw size={14} />
          Aggiorna
        </Button>
      </HStack>

      {/* Messaggio di Stato */}
      {status && (
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={status.type === 'success' ? 'var(--color-success-border)' : 'var(--color-danger-border)'}
          borderWidth="1px"
          borderColor={status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}
        >
          <HStack gap={2}>
            {status.type === 'success' ? (
              <CheckCircle2 size={18} color="var(--color-success)" />
            ) : (
              <AlertCircle size={18} color="var(--color-danger)" />
            )}
            <Text
              fontSize="sm"
              color={status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}
              fontWeight="medium">
              {status.msg}
            </Text>
          </HStack>
        </Box>
      )}

      <Box mb={6}>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" mb={3} color="var(--color-text-muted, #6b7280)">
          Richieste In Attesa ({pendingRequests.length})
        </Text>

        {loadingList ? (
          <HStack justify="center" py={6}>
            <Spinner size="md" color="purple.500" />
            <Text fontSize="sm" color="gray.500">Caricamento richieste...</Text>
          </HStack>
        ) : pendingRequests.length === 0 ? (
          <Box p={6} textAlign="center" borderRadius="xl" border="1px dashed" borderColor="gray.300">
            <Clock size={28} color="gray.400" style={{ margin: '0 auto 8px' }} />
            <Text fontSize="sm" color="gray.500">Nessuna richiesta in attesa di approvazione.</Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {pendingRequests.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <Box
                  key={req.id}
                  p={4}
                  borderRadius="xl"
                  borderWidth="2px"
                  borderColor={isSelected ? 'var(--color-primary-purple)' : 'var(--color-border-default)'}
                  bg={isSelected ? 'var(--color-bg-selected)' : 'var(--color-bg-default)'}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => setSelectedRequest(req)}
                  _hover={{ borderColor: 'var(--color-primary-purple)' }}>

                  <HStack justify="space-between" align="center" mb={2}>
                    <HStack gap={2}>
                      <User size={16} color="var(--color-text-main)" />
                      <Text fontWeight="bold" fontSize="sm">
                        {req.employeeUsername}
                      </Text>
                    </HStack>
                    <Badge colorPalette="amber" px={2} py={0.5} borderRadius="full">
                      In Attesa
                    </Badge>
                  </HStack>

                  <HStack gap={4} fontSize="xs" color="gray.600" wrap="wrap">
                    <HStack gap={1}>
                      <DollarSign size={14} />
                      <Text fontWeight="semibold">€ {req.amount}</Text>
                    </HStack>
                    <HStack gap={1}>
                      <FileText size={14} />
                      <Text>{req.category}</Text>
                    </HStack>
                    {req.expenseDate && (
                      <HStack gap={1}>
                        <Calendar size={14} />
                        <Text>{req.expenseDate}</Text>
                      </HStack>
                    )}
                  </HStack>

                  {req.description && (
                    <Text fontSize="xs" color="gray.500" mt={2} noOfLines={1}>
                      "{req.description}"
                    </Text>
                  )}
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {selectedRequest && (
        <Box p={5} borderRadius="xl" border="1px solid" borderColor="purple.200" bg="gray.50">
          <Heading as="h3" size="xs" textTransform="uppercase" mb={4} color="purple.700">
            Valuta Richiesta #{selectedRequest.id} - {selectedRequest.employeeUsername}
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Box>
                <HStack gap={1.5} mb={2}>
                  {approved === 'true' ? (
                    <CheckCircle2 size={16} color="var(--color-success)" />
                  ) : (
                    <XCircle size={16} color="var(--color-error)" />
                  )}
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    Decisione *
                  </Text>
                </HStack>
                <select
                  className="custom-select"
                  value={approved}
                  onChange={(e) => setApproved(e.target.value)}
                >
                  <option value="true">Approva Spesa (€ {selectedRequest.amount})</option>
                  <option value="false">Rifiuta Spesa</option>
                </select>
              </Box>

              <Box>
                <HStack gap={1.5} mb={2}>
                  <MessageSquare size={16} color="#6b7280" />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    Note del Manager
                  </Text>
                </HStack>
                <Textarea
                  placeholder="Inserisci un commento o motivazione..."
                  rows={3}
                  borderRadius="lg"
                  bg="white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>

              <HStack gap={3} mt={2}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  width="1/3"
                  onClick={() => setSelectedRequest(null)}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  colorPalette={approved === 'true' ? 'green' : 'red'}
                  size="md"
                  width="2/3"
                  loading={submitting}
                  borderRadius="lg"
                  fontWeight="bold"
                >
                  <HStack gap={2}>
                    {approved === 'true' ? <Check size={18} /> : <X size={18} />}
                    <Text>{approved === 'true' ? 'Conferma Approvazione' : 'Conferma Rifiuto'}</Text>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      )}
    </Box>
  );
}