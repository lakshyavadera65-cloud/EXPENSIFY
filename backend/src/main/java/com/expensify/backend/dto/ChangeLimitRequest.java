package com.expensify.backend.dto;
import java.math.BigDecimal;
public class ChangeLimitRequest {
    private BigDecimal newLimit; private String currentPassword;
    public BigDecimal getNewLimit(){return newLimit;} public void setNewLimit(BigDecimal v){newLimit=v;}
    public String getCurrentPassword(){return currentPassword;} public void setCurrentPassword(String v){currentPassword=v;}
}
