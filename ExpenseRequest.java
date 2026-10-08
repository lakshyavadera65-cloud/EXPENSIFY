package com.expensify.backend.dto;
import java.math.BigDecimal; import java.time.LocalDate;
import jakarta.validation.constraints.*;
public class ExpenseRequest {
    @NotNull(message="Amount is required") @Positive(message="Amount must be greater than 0") private BigDecimal amount; 
    @NotBlank(message="Category is required") private String category; 
    private String description; 
    @NotNull(message="Expense date is required") private LocalDate expenseDate;
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public LocalDate getExpenseDate(){return expenseDate;} public void setExpenseDate(LocalDate v){expenseDate=v;}
}
