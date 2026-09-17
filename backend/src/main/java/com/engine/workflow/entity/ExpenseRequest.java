package com.engine.workflow.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expense_requests")
@Getter
@Setter
@NoArgsConstructor
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long processInstanceKey;
    private String employeeUsername;
    private Double amount;
    private String category;
    private String description;
    private String expenseDate;
    private String status; // "DRAFT_TASK_PENDING", "IN_APPROVAL", "APPROVED", "REJECTED"

    public ExpenseRequest(String employeeUsername, Long processInstanceKey, String status) {
        this.employeeUsername = employeeUsername;
        this.processInstanceKey = processInstanceKey;
        this.status = status;
    }
}