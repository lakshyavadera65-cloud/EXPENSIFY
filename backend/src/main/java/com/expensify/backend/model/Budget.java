package com.expensify.backend.model;

import com.expensify.backend.enums.BudgetType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private AppUser user;
    @Enumerated(EnumType.STRING) private BudgetType budgetType;
    private BigDecimal budgetAmount;
    private BigDecimal limitAmount;
    private LocalDate startDate;

    @Transient
    private BigDecimal spent = BigDecimal.ZERO;
    @Transient
    private LocalDate endDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    @Transient
    public Long getUserId() { return user != null ? user.getId() : null; }
    public BudgetType getBudgetType() { return budgetType; }
    public void setBudgetType(BudgetType value) { this.budgetType = value; }
    @Transient
    public BudgetType getType() { return budgetType; }
    public BigDecimal getBudgetAmount() { return budgetAmount; }
    public void setBudgetAmount(BigDecimal value) { this.budgetAmount = value; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal value) { this.limitAmount = value; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate value) { this.startDate = value; }

    public BigDecimal getSpent() { return spent != null ? spent : BigDecimal.ZERO; }
    public void setSpent(BigDecimal spent) { this.spent = spent; }

    public LocalDate getEndDate() {
        if (endDate != null) return endDate;
        if (startDate == null) return LocalDate.now();
        if (budgetType == BudgetType.DAILY) return startDate;
        if (budgetType == BudgetType.WEEKLY) return startDate.plusDays(6);
        if (budgetType == BudgetType.MONTHLY) return startDate.plusMonths(1).minusDays(1);
        return startDate.plusYears(1).minusDays(1);
    }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
