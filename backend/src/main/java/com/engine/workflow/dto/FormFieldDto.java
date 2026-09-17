package com.engine.workflow.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class FormFieldDto {
    private String name;
    private String label;
    private String type;
    private boolean required;
    private String placeholder;
    private List<String> options;

    public FormFieldDto(String name, String label, String type, boolean required, String placeholder, List<String> options) {
        this.name = name;
        this.label = label;
        this.type = type;
        this.required = required;
        this.placeholder = placeholder;
        this.options = options;
    }
}