package com.engine.workflow.config;

import com.engine.workflow.WorkflowVariable;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.DeploymentEvent;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.log4j.Log4j2;

@Configuration
@Log4j2
public class ProcessDeployerConfig {

    @Bean
    public CommandLineRunner deployProcess(ZeebeClient zeebeClient) {
        return args -> {
            try {
                DeploymentEvent deploymentEvent = zeebeClient.newDeployResourceCommand()
                        .addResourceFromClasspath("bpmn/expense-process.bpmn")
                        .addResourceFromClasspath("bpmn/form_expense_details.form")
                        .addResourceFromClasspath("bpmn/form_manager_approval.form")
                        .send()
                        .join();

                log.info("DEPLOY COMPLETATO CON SUCCESSO!");
                deploymentEvent.getProcesses().forEach(p -> 
                    log.info("Processo registrato: ID='{}', Versione={}", p.getBpmnProcessId(), p.getVersion())
                );
            } catch (Exception e) {
                log.error("ERRORE DURANTE IL DEPLOY SU CAMUNDA 8: {}", e.getMessage());
                e.printStackTrace();
            }
        };
    }
}