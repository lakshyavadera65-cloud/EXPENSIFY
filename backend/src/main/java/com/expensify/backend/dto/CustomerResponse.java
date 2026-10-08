package com.expensify.backend.dto;

import com.expensify.backend.enums.UserRole;
import com.expensify.backend.model.AppUser;

public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String city;
    private java.math.BigDecimal totalSpend = java.math.BigDecimal.ZERO;
    private java.math.BigDecimal monthlyLimit = new java.math.BigDecimal("30000.00");
    private String status = "On track";

    public CustomerResponse(AppUser user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.city = user.getCity() != null ? user.getCity() : "Bengaluru";
    }

    public CustomerResponse(AppUser user, java.math.BigDecimal totalSpend, java.math.BigDecimal monthlyLimit) {
        this(user);
        if (totalSpend != null) this.totalSpend = totalSpend;
        if (monthlyLimit != null && monthlyLimit.compareTo(java.math.BigDecimal.ZERO) > 0) this.monthlyLimit = monthlyLimit;

        if (this.monthlyLimit.compareTo(java.math.BigDecimal.ZERO) > 0) {
            double ratio = this.totalSpend.doubleValue() / this.monthlyLimit.doubleValue();
            if (ratio >= 1.0) {
                this.status = "Over budget";
            } else if (ratio >= 0.8) {
                this.status = "Near limit";
            } else {
                this.status = "On track";
            }
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public String getCity() { return city; }
    public java.math.BigDecimal getTotalSpend() { return totalSpend; }
    public java.math.BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public String getStatus() { return status; }
}

