# Smart Workflow Engine - Backend

Modulo backend Spring Boot integrato con **Camunda 8 SaaS (Engine Zeebe)** per la gestione automatizzata dei flussi di approvazione spese.

---

## Panoramica dell'Architettura

* **Deploy Automatico**: all'avvio dell'applicazione Spring Boot (`ProcessDeployerConfig`), il backend invia automaticamente a Zeebe il workflow BPMN e i relativi Camunda Forms nativi.
* **Camunda Forms Nativi**: le User Task (*Compilazione Dettagli* e *Approvazione Manager*) utilizzano schemi `.form` renderizzati direttamente all'interno di Camunda Tasklist.
* **Gestione Tipi & FEEL**: la logica dei gateway XOR converte i dati dei form in stringhe (`= string(approved) = "true"`) per prevenire eccezioni di confronto tra booleani e stringhe JSON.
* **Fall-through Sicuro**: il ramo di rifiuto del gateway è configurato come **Default Flow** per evitare il blocco del processo o la creazione di incidenti su Camunda Operate.

---

## Struttura delle Risorse

Tutti i diagrammi di processo e i form nativi risiedono nella cartella `resources/bpmn/`:

```text
src/main/resources/bpmn/
├── expense-process.bpmn
├── form_expense_details.form
└── form_manager_approval.form
```

---

## Guida all'Avvio

### 1. Prerequisiti

* **Java 17** o superiore
* **Maven 3.8+**
* Un cluster attivo su **Camunda 8 Cloud** con credenziali configurate in `application.yaml` (`zeebe.client.*`).

### 2. Esecuzione

Esegui il comando Maven per avviare l'applicazione backend(su cartella backend)

```bash
mvn clean spring-boot:run
```

Verifica nei log di avvio che il deploy sia andato a buon fine:

```text
 DEPLOY COMPLETATO CON SUCCESSO!
Processo registrato: ID='Process_ExpenseApproval', Versione=X
```

---

## API Endpoints

| Metodo | Endpoint                 | Descrizione                            | Body / Parametri                                          |
| ------ | ------------------------ | -------------------------------------- | --------------------------------------------------------- |
| `POST` | `/api/workflow/start`    | Avvia un'istanza del processo spesa    | `{"variables": {"amount": 550, "category": "Viaggi"}}`    |
| `POST` | `/api/workflow/complete` | Completa una User Task tramite Job Key | `{"jobKey": 12345678, "variables": {"approved": "true"}}` |
