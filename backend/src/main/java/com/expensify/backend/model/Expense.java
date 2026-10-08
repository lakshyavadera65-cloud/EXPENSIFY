package com.expensify.backend.model;

import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @NotNull
    @Positive(message = "Expense amount must be positive")
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private ExpensePaymentMethod paymentMethod = ExpensePaymentMethod.UPI;

    private String description;

    @NotNull
    @Column(name = "expense_date")
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

    public ExpenseCategory getCategory() { return category != null ? category : ExpenseCategory.OTHER; }
    public void setCategory(ExpenseCategory category) { this.category = category; }
    public void setCategory(String categoryStr) { this.category = ExpenseCategory.fromString(categoryStr); }

    public ExpensePaymentMethod getPaymentMethod() { return paymentMethod != null ? paymentMethod : ExpensePaymentMethod.OTHER; }
    public void setPaymentMethod(ExpensePaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setPaymentMethod(String pmStr) { this.paymentMethod = ExpensePaymentMethod.fromString(pmStr); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Transient
    public String getTitle() { return description != null ? description : (category != null ? category.name() : "Expense"); }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    @Transient
    public String getDate() { return expenseDate != null ? expenseDate.toString() : null; }
}
