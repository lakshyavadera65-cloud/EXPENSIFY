package com.expensify.backend.service;
import com.expensify.backend.dto.*; import com.expensify.backend.model.*; import com.expensify.backend.repository.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class BudgetService {
    private final BudgetRepository budgets; private final AppUserRepository users; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
    public BudgetService(BudgetRepository b,AppUserRepository u){budgets=b;users=u;}
    public Budget create(Long userId,BudgetRequest r){
        if(r.getBudgetAmount()==null||r.getLimitAmount()==null||r.getBudgetAmount().doubleValue()<=0||r.getLimitAmount().doubleValue()<=0) throw new IllegalArgumentException("Budget and limit must be greater than 0");
        java.util.Optional<AppUser> foundUser=users.findById(userId);
        if(foundUser.isEmpty()) throw new IllegalArgumentException("User not found");
        AppUser user=foundUser.get();
        Budget b=new Budget(); b.setUser(user); b.setBudgetType(r.getBudgetType()); b.setBudgetAmount(r.getBudgetAmount()); b.setLimitAmount(r.getLimitAmount()); b.setStartDate(r.getStartDate()); return budgets.save(b);
    }
    public List<Budget> getByUser(Long userId){return budgets.findByUserId(userId);}
    public Budget get(Long budgetId) {
        java.util.Optional<Budget> foundBudget=budgets.findById(budgetId);
        if(foundBudget.isEmpty()) throw new IllegalArgumentException("Budget not found");
        return foundBudget.get();
    }
    public Budget changeLimit(Long budgetId,ChangeLimitRequest r){
        Budget b=get(budgetId);
        if(!encoder.matches(r.getCurrentPassword(),b.getUser().getPasswordHash())) throw new IllegalArgumentException("Wrong password");
        b.setLimitAmount(r.getNewLimit()); return budgets.save(b);
    }
}
