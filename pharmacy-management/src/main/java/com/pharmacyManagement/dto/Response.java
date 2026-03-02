package com.pharmacyManagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {
    private boolean success;
    private Object data;
    private String message;
    private int status;

    // Add this manually for production
    public Response(boolean success, Object data, String message, int status) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.status = status;
    }
}