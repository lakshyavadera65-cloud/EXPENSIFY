package com.expensify.backend.dto;
import com.expensify.backend.enums.BudgetType; import java.math.BigDecimal; import java.time.LocalDate;
import jakarta.validation.constraints.*;
public class BudgetRequest {
    @NotNull(message="Budget type is required") private BudgetType budgetType; 
    @NotNull(message="Budget amount is required") @Positive(message="Amount must be positive") private BigDecimal budgetAmount; 
    @NotNull(message="Limit amount is required") @Positive(message="Limit must be positive") private BigDecimal limitAmount; 
    @NotNull(message="Start date is required") private LocalDate startDate;
    public BudgetType getBudgetType(){return budgetType;} public void setBudgetType(BudgetType v){budgetType=v;}
    public BudgetType getType(){return budgetType;} public void setType(BudgetType v){budgetType=v;}
    public BigDecimal getBudgetAmount(){return budgetAmount;} public void setBudgetAmount(BigDecimal v){budgetAmount=v;}
    public BigDecimal getLimitAmount(){return limitAmount;} public void setLimitAmount(BigDecimal v){limitAmount=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
}
