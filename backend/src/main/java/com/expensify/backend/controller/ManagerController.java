package com.expensify.backend.controller;
import com.expensify.backend.dto.CustomerResponse; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.ManagerService; import org.springframework.web.bind.annotation.*; import java.util.List; import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/managers")
public class ManagerController {
    private final ManagerService managers;
    private final com.expensify.backend.repository.ExpenseRepository expenses;
    private final com.expensify.backend.repository.BudgetRepository budgets;

    public ManagerController(ManagerService managers,
                             com.expensify.backend.repository.ExpenseRepository expenses,
                             com.expensify.backend.repository.BudgetRepository budgets) {
        this.managers = managers;
        this.expenses = expenses;
        this.budgets = budgets;
    }

    @PostMapping("/{managerId}/customers/{customerId}") 
    public AppUser assign(@PathVariable Long managerId, @PathVariable Long customerId, HttpServletRequest req){
        if (!managerId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return managers.assign(managerId, customerId);
    }

    @GetMapping("/{managerId}/customers") 
    public List<CustomerResponse> customers(@PathVariable Long managerId, HttpServletRequest req){
        if (!managerId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return managers.getCustomers(managerId).stream().map(user -> {
            java.math.BigDecimal total = expenses.findByUserId(user.getId()).stream()
                    .map(com.expensify.backend.model.Expense::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            java.math.BigDecimal limit = budgets.findByUserId(user.getId()).stream()
                    .filter(b -> b.getBudgetType() == com.expensify.backend.enums.BudgetType.MONTHLY)
                    .findFirst()
                    .map(com.expensify.backend.model.Budget::getLimitAmount)
                    .orElse(new java.math.BigDecimal("30000.00"));
            return new CustomerResponse(user, total, limit);
        }).collect(Collectors.toList());
    }
}
