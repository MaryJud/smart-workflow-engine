package com.engine.workflow.service;

import com.engine.workflow.dto.FormFieldDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import static com.engine.workflow.WorkflowVariable.*;

@Service
public class WorkflowFormService {

    @Autowired
    private MessageSource messageSource;

    public List<FormFieldDto> getSchemaByFormKey(String formKey) {
        Locale locale = LocaleContextHolder.getLocale();

        return switch (formKey) {
            case FORM_EXPENSE_DETAILS -> List.of(
                new FormFieldDto(
                    FIELD_AMOUNT, 
                    msg("field.expense.amount.label", locale), 
                    "number", true, 
                    msg("field.expense.amount.placeholder", locale), 
                    null
                ),
                new FormFieldDto(
                    FIELD_CATEGORY, 
                    msg("field.expense.category.label", locale), 
                    "select", true, null, 
                    List.of(
                        msg("field.expense.category.meals", locale),
                        msg("field.expense.category.travel", locale),
                        msg("field.expense.category.hardware", locale),
                        msg("field.expense.category.training", locale)
                    )
                ),
                new FormFieldDto(
                    FIELD_EXPENSE_DATE, 
                    msg("field.expense.date.label", locale), 
                    "date", true, null, null
                ),
                new FormFieldDto(
                    FIELD_DESCRIPTION, 
                    msg("field.expense.description.label", locale), 
                    "textarea", true, 
                    msg("field.expense.description.placeholder", locale), 
                    null
                )
            );

            case FORM_MANAGER_APPROVAL -> List.of(
                new FormFieldDto(
                    FIELD_APPROVED, 
                    msg("field.approval.status.label", locale), 
                    "select", true, null, 
                    List.of("true", "false")
                ),
                new FormFieldDto(
                    FIELD_MANAGER_NOTES, 
                    msg("field.approval.notes.label", locale), 
                    "textarea", false, 
                    msg("field.approval.notes.placeholder", locale), 
                    null
                )
            );

            default -> Collections.emptyList();
        };
    }

    private String msg(String key, Locale locale) {
        return messageSource.getMessage(key, null, locale);
    }
}