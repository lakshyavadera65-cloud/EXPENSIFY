package com.expensify.backend.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryDTO {
    private BigDecimal totalSpending = BigDecimal.ZERO;
    private BigDecimal todaySpending = BigDecimal.ZERO;
    private BigDecimal thisWeekSpending = BigDecimal.ZERO;
    private BigDecimal thisMonthSpending = BigDecimal.ZERO;
    private BigDecimal thisYearSpending = BigDecimal.ZERO;
    private BigDecimal averageDailySpending = BigDecimal.ZERO;
    private Long transactionCount = 0L;
    private String highestSpendingCategory = "N/A";
    private String highestSpendingDay = "N/A";
    private BigDecimal budgetUsedPercentage = BigDecimal.ZERO;
    private BigDecimal remainingBudget = BigDecimal.ZERO;
    private BigDecimal totalBudget = BigDecimal.ZERO;

    public AnalyticsSummaryDTO() {}

    public BigDecimal getTotalSpending() { return totalSpending; }
    public void setTotalSpending(BigDecimal totalSpending) { this.totalSpending = totalSpending; }

    public BigDecimal getTodaySpending() { return todaySpending; }
    public void setTodaySpending(BigDecimal todaySpending) { this.todaySpending = todaySpending; }

    public BigDecimal getThisWeekSpending() { return thisWeekSpending; }
    public void setThisWeekSpending(BigDecimal thisWeekSpending) { this.thisWeekSpending = thisWeekSpending; }

    public BigDecimal getThisMonthSpending() { return thisMonthSpending; }
    public void setThisMonthSpending(BigDecimal thisMonthSpending) { this.thisMonthSpending = thisMonthSpending; }

    public BigDecimal getThisYearSpending() { return thisYearSpending; }
    public void setThisYearSpending(BigDecimal thisYearSpending) { this.thisYearSpending = thisYearSpending; }

    public BigDecimal getAverageDailySpending() { return averageDailySpending; }
    public void setAverageDailySpending(BigDecimal averageDailySpending) { this.averageDailySpending = averageDailySpending; }

    public Long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Long transactionCount) { this.transactionCount = transactionCount; }

    public String getHighestSpendingCategory() { return highestSpendingCategory; }
    public void setHighestSpendingCategory(String highestSpendingCategory) { this.highestSpendingCategory = highestSpendingCategory; }

    public String getHighestSpendingDay() { return highestSpendingDay; }
    public void setHighestSpendingDay(String highestSpendingDay) { this.highestSpendingDay = highestSpendingDay; }

    public BigDecimal getBudgetUsedPercentage() { return budgetUsedPercentage; }
    public void setBudgetUsedPercentage(BigDecimal budgetUsedPercentage) { this.budgetUsedPercentage = budgetUsedPercentage; }

    public BigDecimal getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(BigDecimal remainingBudget) { this.remainingBudget = remainingBudget; }

    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
}
