package com.aptiv.internship.dto.response;

public class BatchSuccessResponse {
    private boolean success = true;
    private String message;
    private int count;

    public BatchSuccessResponse(String message, int count) {
        this.message = message;
        this.count = count;
    }

    // getters and setters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}

