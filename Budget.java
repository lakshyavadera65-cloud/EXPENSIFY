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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public BudgetType getBudgetType() { return budgetType; }
    public void setBudgetType(BudgetType value) { this.budgetType = value; }
    public BigDecimal getBudgetAmount() { return budgetAmount; }
    public void setBudgetAmount(BigDecimal value) { this.budgetAmount = value; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal value) { this.limitAmount = value; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate value) { this.startDate = value; }
}
