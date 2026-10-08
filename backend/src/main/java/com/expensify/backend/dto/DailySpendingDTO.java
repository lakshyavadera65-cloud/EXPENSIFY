package com.expensify.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailySpendingDTO {
    private LocalDate date;
    private BigDecimal amount = BigDecimal.ZERO;
    private Long transactionCount = 0L;

    public DailySpendingDTO() {}

    public DailySpendingDTO(LocalDate date, BigDecimal amount, Long transactionCount) {
        this.date = date;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.transactionCount = transactionCount != null ? transactionCount : 0L;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
}
