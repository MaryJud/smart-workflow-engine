package com.engine.workflow.repository;

import com.engine.workflow.entity.ExpenseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExpenseRequestRepository extends JpaRepository<ExpenseRequest, Long> {
    List<ExpenseRequest> findByEmployeeUsername(String employeeUsername);
    Optional<ExpenseRequest> findByProcessInstanceKey(Long processInstanceKey);
    List<ExpenseRequest> findByStatus(String status);
}