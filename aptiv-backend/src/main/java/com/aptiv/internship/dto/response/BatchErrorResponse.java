package com.aptiv.internship.dto.response;

public class BatchErrorResponse {
    private boolean success = false;
    private String error;
    private String message;

    public BatchErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
    }

    // getters and setters
    public boolean isSuccess() { return success; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
