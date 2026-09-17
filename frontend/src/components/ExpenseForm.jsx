import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
} from "@chakra-ui/react";
import {
  Send,
  Euro,
  Tag,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { startExpenseProcess } from "../api/workflowApi";

export default function ExpenseForm({currentUser}) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "Trasporti & Viaggi",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await startExpenseProcess(formData,currentUser);
      setStatus({
        type: "success",
        msg: "Richiesta inviata con successo! Flusso avviato.",
      });
      setFormData({
        amount: "",
        category: "Trasporti & Viaggi",
        description: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: "Errore nell'invio della richiesta. Verifica la connessione al backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="cardBox">
      <HStack justify="space-between" align="center" mb={6}>
        <HStack gap={2}>
          <Receipt size={22} color="var(--color-primary-blue)" />
          <Heading as="h2" size="md" color="var(--color-text-main)">
            Compila Spesa
          </Heading>
        </HStack>
        <Badge colorPalette="blue" px={2.5} py={1} borderRadius="full">
          Dipendente
        </Badge>
      </HStack>

      {status && (
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={status.type === "success" ? "var(--color-success)" : "var(--color-danger)"}
          borderWidth="1px"
          borderColor={status.type === "success" ? "var(--color-success-border)" : "var(--color-danger-border)"}  >
          <HStack gap={2}>
            {status.type === "success" ? (
              <CheckCircle2 size={18} color="var(--color-text-success)" />
            ) : (
              <AlertCircle size={18} color="var(--color-text-danger)" />
            )}
            <Text fontSize="sm"
              color={status.type === "success" ? "var(--color-text-success)" : "var(--color-text-danger)"}
              fontWeight="medium">
              {status.msg}
            </Text>
          </HStack>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={5} align="stretch">
          <Box>
            <HStack gap={1.5} mb={2}>
              <Euro size={14} color="var(--color-text-muted)" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="var(--color-text-main)" required="true">
                Importo (€) *
              </Text>
            </HStack>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              size="lg"
              borderRadius="lg"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })} />
          </Box>

          <Box>
            <HStack gap={1.5} mb={2}>
              <Tag size={14} color="var(--color-text-muted)" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="var(--color-text-main)"
                required="true">
                Categoria *
              </Text>
            </HStack>
            <select className="custom-select" value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })} >
              <option value="Trasporti & Viaggi">Trasporti & Viaggi</option>
              <option value="Vitto & Alloggio">Vitto & Alloggio</option>
              <option value="Materiale d'ufficio">Materiale d'ufficio</option>
              <option value="Altro">Altro</option>
            </select>
          </Box>

          <Box>
            <HStack gap={1.5} mb={2}>
              <Calendar size={14} color="var(--color-text-muted)" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="var(--color-text-main)" required="true" >
                Data della Spesa *
              </Text>
            </HStack>
            <Input
              type="date"
              required
              size="lg"
              borderRadius="lg"
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({ ...formData, expenseDate: e.target.value })
              }
            />
          </Box>

          <Box>
            <HStack gap={1.5} mb={2}>
              <FileText size={14} color="var(--color-text-muted)" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="var(--color-text-main)"
                required="true" >
                Descrizione / Note *
              </Text>
            </HStack>
            <Textarea
              placeholder="Fornisci dettagli sul motivo della spesa..."
              rows={3}
              required
              borderRadius="lg"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Box>

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            width="full"
            loading={loading}
            borderRadius="lg"
            fontWeight="bold"
            mt={2} >
            <HStack gap={2}>
              <Send size={18} />
              <Text>Invia Richiesta</Text>
            </HStack>
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
