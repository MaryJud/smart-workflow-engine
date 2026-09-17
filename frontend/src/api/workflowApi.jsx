import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const loginUser = async (username) => {
  const response = await axios.post(`${API_BASE}/auth/login`, { username });
  return response.data;
};

// Avvia il workflow e crea la bozza su H2
export const startExpenseWorkflow = async (employeeId) => {
  const response = await axios.post(`${API_BASE}/workflow/start`, {
    variables: { employeeId }
  });
  return response.data;
};

// Invio dettagli spesa (Dipendente) -> /complete-details
export const submitExpenseDetails = async (jobKey, processInstanceKey, formData) => {
  const response = await axios.post(`${API_BASE}/workflow/complete-details`, {
    jobKey: Number(jobKey),
    processInstanceKey: Number(processInstanceKey),
    variables: {
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      expenseDate: formData.expenseDate,
    },
  });
  return response.data;
};

// Valutazione Manager (Approvazione/Rifiuto) -> /complete-approval
export const completeTask = async (jobKey, approved, notes, processInstanceKey = null) => {
  const response = await axios.post(`${API_BASE}/workflow/complete-approval`, {
    jobKey: Number(jobKey),
    processInstanceKey: processInstanceKey ? Number(processInstanceKey) : null,
    variables: {
      approved: approved === 'true' || approved === true,
      notes: notes || '',
    },
  });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await axios.get(`${API_BASE}/workflow/requests/pending`);
  return response.data;
};

// Completa l'approvazione del Manager
export const completeApprovalTask = async (payload) => {
  const response = await axios.post(`${API_BASE}/workflow/complete-approval`, payload);
  return response.data;
};