package com.expensify.backend.dto;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;
public class ChangeLimitRequest {
    @NotNull(message="New limit is required") @Positive(message="Limit must be positive") private BigDecimal newLimit; 
    @NotBlank(message="Password is required") private String currentPassword;
    public BigDecimal getNewLimit(){return newLimit;} public void setNewLimit(BigDecimal v){newLimit=v;}
    public String getCurrentPassword(){return currentPassword;} public void setCurrentPassword(String v){currentPassword=v;}
}
