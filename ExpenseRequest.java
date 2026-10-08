package com.expensify.backend.dto;
import java.math.BigDecimal; import java.time.LocalDate;
public class ExpenseRequest {
    private BigDecimal amount; private String category; private String description; private LocalDate expenseDate;
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public LocalDate getExpenseDate(){return expenseDate;} public void setExpenseDate(LocalDate v){expenseDate=v;}
}
