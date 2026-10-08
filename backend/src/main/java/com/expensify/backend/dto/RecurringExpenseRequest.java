package com.expensify.backend.dto;

import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.enums.RecurringFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringExpenseRequest {
    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    private ExpenseCategory category = ExpenseCategory.OTHER;
    private ExpensePaymentMethod paymentMethod = ExpensePaymentMethod.UPI;
    private RecurringFrequency frequency = RecurringFrequency.MONTHLY;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }
    public void setCategory(String categoryStr) {
        this.category = ExpenseCategory.fromString(categoryStr);
    }

    public ExpensePaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(ExpensePaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setPaymentMethod(String pmStr) {
        this.paymentMethod = ExpensePaymentMethod.fromString(pmStr);
    }

    public RecurringFrequency getFrequency() { return frequency; }
    public void setFrequency(RecurringFrequency frequency) { this.frequency = frequency; }
    public void setFrequency(String freqStr) {
        this.frequency = RecurringFrequency.fromString(freqStr);
    }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
