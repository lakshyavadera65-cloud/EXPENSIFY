package com.expensify.backend.dto;

import com.expensify.backend.enums.ExpensePaymentMethod;
import java.math.BigDecimal;

public class PaymentMethodSpendingDTO {
    private ExpensePaymentMethod paymentMethod;
    private String paymentMethodName;
    private BigDecimal amount = BigDecimal.ZERO;
    private Double percentage = 0.0;
    private Long transactionCount = 0L;

    public PaymentMethodSpendingDTO() {}

    public PaymentMethodSpendingDTO(ExpensePaymentMethod paymentMethod, BigDecimal amount, Long transactionCount) {
        this.paymentMethod = paymentMethod;
        this.paymentMethodName = paymentMethod != null ? paymentMethod.name() : "OTHER";
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.transactionCount = transactionCount != null ? transactionCount : 0L;
    }

    public ExpensePaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(ExpensePaymentMethod paymentMethod) { 
        this.paymentMethod = paymentMethod; 
        this.paymentMethodName = paymentMethod != null ? paymentMethod.name() : "OTHER";
    }

    public String getPaymentMethodName() { return paymentMethodName; }
    public void setPaymentMethodName(String paymentMethodName) { this.paymentMethodName = paymentMethodName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
}
