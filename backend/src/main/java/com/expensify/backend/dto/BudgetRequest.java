package com.expensify.backend.dto;
import com.expensify.backend.enums.BudgetType; import java.math.BigDecimal; import java.time.LocalDate;
public class BudgetRequest {
    private BudgetType budgetType; private BigDecimal budgetAmount; private BigDecimal limitAmount; private LocalDate startDate;
    public BudgetType getBudgetType(){return budgetType;} public void setBudgetType(BudgetType v){budgetType=v;}
    public BudgetType getType(){return budgetType;} public void setType(BudgetType v){budgetType=v;}
    public BigDecimal getBudgetAmount(){return budgetAmount;} public void setBudgetAmount(BigDecimal v){budgetAmount=v;}
    public BigDecimal getLimitAmount(){return limitAmount;} public void setLimitAmount(BigDecimal v){limitAmount=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
}
