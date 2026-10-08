package com.expensify.backend.dto;

import com.expensify.backend.enums.ExpenseCategory;
import java.math.BigDecimal;

public class CategorySpendingDTO {
    private ExpenseCategory category;
    private String categoryName;
    private BigDecimal amount = BigDecimal.ZERO;
    private Double percentage = 0.0;
    private Long transactionCount = 0L;

    public CategorySpendingDTO() {}

    public CategorySpendingDTO(ExpenseCategory category, BigDecimal amount, Long transactionCount) {
        this.category = category;
        this.categoryName = category != null ? category.name() : "OTHER";
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.transactionCount = transactionCount != null ? transactionCount : 0L;
    }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { 
        this.category = category; 
        this.categoryName = category != null ? category.name() : "OTHER";
    }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
}
