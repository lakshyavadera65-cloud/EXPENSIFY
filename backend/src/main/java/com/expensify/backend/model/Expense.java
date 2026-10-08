package com.expensify.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private AppUser user;
    private BigDecimal amount;
    private String category;
    private String description;
    private LocalDate expenseDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    @Transient
    public Long getUserId() { return user != null ? user.getId() : null; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    @Transient
    public String getTitle() { return description != null ? description : category; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    @Transient
    public String getDate() { return expenseDate != null ? expenseDate.toString() : null; }
}
