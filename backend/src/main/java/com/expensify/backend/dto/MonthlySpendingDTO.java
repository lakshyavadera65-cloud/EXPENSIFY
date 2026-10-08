package com.expensify.backend.dto;

import java.math.BigDecimal;

public class MonthlySpendingDTO {
    private int year;
    private int month;
    private String monthName;
    private BigDecimal amount = BigDecimal.ZERO;
    private Long transactionCount = 0L;

    public MonthlySpendingDTO() {}

    public MonthlySpendingDTO(int year, int month, String monthName, BigDecimal amount, Long transactionCount) {
        this.year = year;
        this.month = month;
        this.monthName = monthName;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.transactionCount = transactionCount != null ? transactionCount : 0L;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public String getMonthName() { return monthName; }
    public void setMonthName(String monthName) { this.monthName = monthName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }
}
