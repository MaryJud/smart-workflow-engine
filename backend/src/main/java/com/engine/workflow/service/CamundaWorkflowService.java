package com.engine.workflow.service;

import com.engine.workflow.WorkflowVariable;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CamundaWorkflowService {

    @Autowired
    private ZeebeClient zeebeClient;

    public long startExpenseProcess(Map<String, Object> variables) {
        ProcessInstanceEvent processInstance = zeebeClient.newCreateInstanceCommand()
                .bpmnProcessId(WorkflowVariable.PROCESS_EXPENSE_APPROVAL)
                .latestVersion()
                .tenantId("<default>")
                .variables(variables)
                .send()
                .join();

        return processInstance.getProcessInstanceKey();
    }

    public void completeTask(long jobKey, Map<String, Object> variables) {
        zeebeClient.newCompleteCommand(jobKey)
                .variables(variables)
                .send()
                .join();
    }
}