package com.engine.workflow.dto;

import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class StartProcessRequest {
    private Map<String, Object> variables;

    public StartProcessRequest(Map<String, Object> variables) {
        this.variables = variables;
    }
}