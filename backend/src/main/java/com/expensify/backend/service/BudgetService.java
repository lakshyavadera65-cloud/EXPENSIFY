package com.expensify.backend.service;
import com.expensify.backend.dto.*; import com.expensify.backend.model.*; import com.expensify.backend.repository.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class BudgetService {
    private final BudgetRepository budgets; 
    private final AppUserRepository users; 
    private final ExpenseRepository expenses;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public BudgetService(BudgetRepository b, AppUserRepository u, ExpenseRepository e){
        this.budgets = b;
        this.users = u;
        this.expenses = e;
    }

    public Budget create(Long userId, BudgetRequest r){
        if(r.getBudgetAmount()==null||r.getLimitAmount()==null||r.getBudgetAmount().doubleValue()<=0||r.getLimitAmount().doubleValue()<=0) throw new IllegalArgumentException("Budget and limit must be greater than 0");
        java.util.Optional<AppUser> foundUser=users.findById(userId);
        if(foundUser.isEmpty()) throw new IllegalArgumentException("User not found");
        AppUser user=foundUser.get();
        Budget b=new Budget(); 
        b.setUser(user); 
        b.setBudgetType(r.getType() != null ? r.getType() : r.getBudgetType()); 
        b.setBudgetAmount(r.getBudgetAmount()); 
        b.setLimitAmount(r.getLimitAmount()); 
        b.setStartDate(r.getStartDate()); 
        return budgets.save(b);
    }

    public List<Budget> getByUser(Long userId){
        List<Budget> list = budgets.findByUserId(userId);
        for (Budget b : list) {
            java.time.LocalDate end = b.getEndDate();
            java.time.LocalDate start = b.getStartDate() != null ? b.getStartDate() : java.time.LocalDate.now().withDayOfMonth(1);
            List<Expense> expenseList = expenses.findByUserIdAndExpenseDateBetween(userId, start, end);
            java.math.BigDecimal spent = java.math.BigDecimal.ZERO;
            for (Expense e : expenseList) {
                spent = spent.add(e.getAmount());
            }
            b.setSpent(spent);
        }
        return list;
    }
    public Budget changeLimit(Long budgetId,ChangeLimitRequest r, Long callerId){
        java.util.Optional<Budget> foundBudget=budgets.findById(budgetId);
        if(foundBudget.isEmpty()) throw new IllegalArgumentException("Budget not found");
        Budget b=foundBudget.get();
        if(!b.getUser().getId().equals(callerId)) throw new SecurityException("Unauthorized");
        if(!encoder.matches(r.getCurrentPassword(),b.getUser().getPasswordHash())) throw new IllegalArgumentException("Wrong password");
        b.setLimitAmount(r.getNewLimit()); return budgets.save(b);
    }
}
