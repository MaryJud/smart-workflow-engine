package com.engine.workflow.controller;

import com.engine.workflow.entity.ExpenseRequest;
import com.engine.workflow.repository.ExpenseRequestRepository;
import io.camunda.zeebe.client.ZeebeClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import static com.engine.workflow.WorkflowVariable.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final ZeebeClient zeebeClient;
    private final ExpenseRequestRepository expenseRequestRepository;
    private final RestTemplate restTemplate;

    @Value("${camunda.client.cloud.cluster-id:}")
    private String clusterId;

    @Value("${camunda.client.cloud.region:fra-1}")
    private String region;

    @Value("${camunda.client.auth.client-id:}")
    private String clientId;

    @Value("${camunda.client.auth.client-secret:}")
    private String clientSecret;

    @Value("${camunda.client.cloud.tasklist-url:https://fra-1.tasklist.camunda.io}")
    private String tasklistUrl;

    public WorkflowController(ZeebeClient zeebeClient, ExpenseRequestRepository expenseRequestRepository) {
        this.zeebeClient = zeebeClient;
        this.expenseRequestRepository = expenseRequestRepository;
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/start")
    public ResponseEntity<?> startProcess(@RequestBody Map<String, Object> body) {
        Map<String, Object> variables = (Map<String, Object>) body.get("variables");
        String employeeUsername = (String) variables.get("employeeId");

        var event = zeebeClient.newCreateInstanceCommand()
                .bpmnProcessId(PROCESS_EXPENSE_APPROVAL)
                .latestVersion()
                .variables(variables)
                .send()
                .join();

        long processInstanceKey = event.getProcessInstanceKey();

        ExpenseRequest request = new ExpenseRequest(employeeUsername, processInstanceKey, "DRAFT_TASK_PENDING");
        expenseRequestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "message", "Workflow avviato con successo",
                "processInstanceKey", processInstanceKey,
                "requestId", request.getId()));
    }

    @PostMapping("/complete-details")
    public ResponseEntity<?> completeDetailsTask(@RequestBody Map<String, Object> body) {
        Long processInstanceKey = Long.valueOf(body.get("processInstanceKey").toString());
        Map<String, Object> variables = (Map<String, Object>) body.get("variables");

        // Forza la conversione di 'amount' a Double numerico per evitare errori FEEL
        if (variables.containsKey(FIELD_AMOUNT)) {
            variables.put(FIELD_AMOUNT, Double.valueOf(variables.get(FIELD_AMOUNT).toString()));
        }

        // 1. Recupera l'ID del task attivo via Tasklist REST API
        Long taskKey = fetchActiveTaskId(processInstanceKey);

        // 2. Completa il task nativamente via ZeebeClient
        completeTask(taskKey, variables);

        // 3. Aggiorna il database locale
        expenseRequestRepository.findByProcessInstanceKey(processInstanceKey).ifPresent(req -> {
            req.setAmount(Double.valueOf(variables.get(FIELD_AMOUNT).toString()));
            req.setCategory((String) variables.get(FIELD_CATEGORY));
            req.setDescription((String) variables.get(FIELD_DESCRIPTION));
            req.setExpenseDate((String) variables.get(FIELD_EXPENSE_DATE));
            req.setStatus("PENDING_MANAGER_APPROVAL");
            expenseRequestRepository.save(req);
        });

        return ResponseEntity.ok(Map.of("message", "Task completato e inviato al Manager"));
    }

    @PostMapping("/complete-approval")
    public ResponseEntity<?> completeApprovalTask(@RequestBody Map<String, Object> body) {
        Long processInstanceKey = Long.valueOf(body.get("processInstanceKey").toString());
        Map<String, Object> variables = (Map<String, Object>) body.get("variables");
        boolean approved = Boolean.parseBoolean(variables.get(FIELD_APPROVED).toString());

        Long taskKey = fetchActiveTaskId(processInstanceKey);
        completeTask(taskKey, variables);

        expenseRequestRepository.findByProcessInstanceKey(processInstanceKey).ifPresent(req -> {
            req.setStatus(approved ? "APPROVED" : "REJECTED");
            expenseRequestRepository.save(req);
        });

        return ResponseEntity.ok(Map.of("message", "Decisione manager registrata con successo"));
    }

    @GetMapping("/requests/employee/{username}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByEmployee(@PathVariable String username) {
        return ResponseEntity.ok(expenseRequestRepository.findByEmployeeUsername(username));
    }

    private String getTasklistAuthToken() {
        String authUrl = "https://login.cloud.camunda.io/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("audience", "tasklist.camunda.io");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        Map<?, ?> response = restTemplate.postForObject(authUrl, request, Map.class);

        if (response != null && response.containsKey("access_token")) {
            return (String) response.get("access_token");
        }
        throw new IllegalStateException("Impossibile ottenere il token OAuth2 per Tasklist API");
    }

    private Long fetchActiveTaskId(Long processInstanceKey) {
        String token = getTasklistAuthToken();
        String baseUrl = tasklistUrl.endsWith("/") ? tasklistUrl.substring(0, tasklistUrl.length() - 1) : tasklistUrl;
        String searchEndpoint = baseUrl + "/" + clusterId + "/v1/tasks/search";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> searchRequest = Map.of(
                "processInstanceKey", String.valueOf(processInstanceKey),
                "state", "CREATED"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(searchRequest, headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(searchEndpoint, HttpMethod.POST, entity, List.class);
            List<Map<String, Object>> tasks = response.getBody();

            if (tasks != null && !tasks.isEmpty()) {
                String taskIdStr = (String) tasks.get(0).get("id");
                return Long.valueOf(taskIdStr);
            }
        } catch (Exception e) {
            throw new RuntimeException("Errore nel recupero del task da Tasklist API", e);
        }

        throw new IllegalStateException("Nessun task attivo trovato per processInstanceKey: " + processInstanceKey);
    }

    private void completeTask(Long taskKey, Map<String, Object> variables) {
        try {
            // Tenta il completamento via Zeebe User Task (Camunda 8.5+)
            zeebeClient.newUserTaskCompleteCommand(taskKey)
                    .variables(variables)
                    .send()
                    .join();
        } catch (Exception e) {
            // Fallback per Job-based tasks
            zeebeClient.newCompleteCommand(taskKey)
                    .variables(variables)
                    .send()
                    .join();
        }
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<ExpenseRequest>> getPendingRequests() {
        return ResponseEntity.ok(expenseRequestRepository.findByStatus("PENDING_MANAGER_APPROVAL"));
    }
}