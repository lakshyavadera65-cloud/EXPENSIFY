package com.expensify.backend.model;

import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.enums.RecurringFrequency;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_expenses")
public class RecurringExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @NotNull
    private String description;

    @NotNull
    @Positive(message = "Recurring amount must be positive")
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private ExpensePaymentMethod paymentMethod = ExpensePaymentMethod.UPI;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RecurringFrequency frequency = RecurringFrequency.MONTHLY;

    @NotNull
    @Column(name = "start_date")
    private LocalDate startDate;

    @NotNull
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private boolean active = true;

    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RecurringExpense() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    @Transient
    public Long getUserId() { return user != null ? user.getId() : null; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public ExpenseCategory getCategory() { return category != null ? category : ExpenseCategory.OTHER; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public ExpensePaymentMethod getPaymentMethod() { return paymentMethod != null ? paymentMethod : ExpensePaymentMethod.OTHER; }
    public void setPaymentMethod(ExpensePaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public RecurringFrequency getFrequency() { return frequency != null ? frequency : RecurringFrequency.MONTHLY; }
    public void setFrequency(RecurringFrequency frequency) { this.frequency = frequency; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDate getLastGeneratedDate() { return lastGeneratedDate; }
    public void setLastGeneratedDate(LocalDate lastGeneratedDate) { this.lastGeneratedDate = lastGeneratedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
