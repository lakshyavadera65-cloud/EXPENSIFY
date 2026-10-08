package com.expensify.backend.controller;

import com.expensify.backend.dto.CustomerResponse;
import com.expensify.backend.enums.BudgetType;
import com.expensify.backend.enums.UserRole;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Budget;
import com.expensify.backend.model.Expense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.BudgetRepository;
import com.expensify.backend.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final AppUserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public CustomerController(AppUserRepository userRepository,
                              ExpenseRepository expenseRepository,
                              BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    @GetMapping
    public List<CustomerResponse> getCustomers(@RequestParam(value = "unassigned", required = false) Boolean unassigned) {
        List<AppUser> all = userRepository.findAll();
        List<AppUser> filtered = all.stream()
                .filter(u -> u.getRole() == UserRole.CUSTOMER)
                .filter(u -> unassigned == null || !unassigned || u.getManager() == null)
                .collect(Collectors.toList());

        return filtered.stream().map(this::toCustomerResponse).collect(Collectors.toList());
    }

    @GetMapping("/{customerId}/detail")
    public Map<String, Object> getCustomerDetail(@PathVariable Long customerId) {
        AppUser customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        CustomerResponse base = toCustomerResponse(customer);
        List<Expense> expenses = expenseRepository.findByUserId(customerId);
        List<Budget> budgets = budgetRepository.findByUserId(customerId);

        // Calculate daily totals for last 7 days
        Map<LocalDate, BigDecimal> dailyMap = new TreeMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            dailyMap.put(today.minusDays(i), BigDecimal.ZERO);
        }
        for (Expense e : expenses) {
            if (e.getExpenseDate() != null && dailyMap.containsKey(e.getExpenseDate())) {
                dailyMap.put(e.getExpenseDate(), dailyMap.get(e.getExpenseDate()).add(e.getAmount()));
            }
        }
        List<Map<String, Object>> dailyList = dailyMap.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", entry.getKey().toString());
                    item.put("amount", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id", base.getId());
        response.put("name", base.getName());
        response.put("email", base.getEmail());
        response.put("city", base.getCity());
        response.put("totalSpend", base.getTotalSpend());
        response.put("monthlyLimit", base.getMonthlyLimit());
        response.put("status", base.getStatus());
        response.put("expenses", expenses);
        response.put("budgets", budgets);
        response.put("daily", dailyList);

        return response;
    }

    private CustomerResponse toCustomerResponse(AppUser user) {
        List<Expense> expenses = expenseRepository.findByUserId(user.getId());
        BigDecimal totalSpend = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        BigDecimal monthlyLimit = budgets.stream()
                .filter(b -> b.getBudgetType() == BudgetType.MONTHLY)
                .findFirst()
                .map(Budget::getLimitAmount)
                .orElse(new BigDecimal("30000.00"));

        return new CustomerResponse(user, totalSpend, monthlyLimit);
    }
}
