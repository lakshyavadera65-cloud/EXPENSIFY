package com.expensify.backend.service;
import com.expensify.backend.dto.ExpenseRequest; import com.expensify.backend.model.*; import com.expensify.backend.repository.*; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class ExpenseService {
    private final ExpenseRepository expenses; private final AppUserRepository users; private final BudgetAlertService alerts;
    public ExpenseService(ExpenseRepository expenses,AppUserRepository users,BudgetAlertService alerts){this.expenses=expenses;this.users=users;this.alerts=alerts;}
    public Expense add(Long userId, ExpenseRequest r){
        if(r.getAmount()==null || r.getAmount().doubleValue()<=0) throw new IllegalArgumentException("Amount must be greater than 0");
        java.util.Optional<AppUser> foundUser=users.findById(userId);
        if(foundUser.isEmpty()) throw new IllegalArgumentException("User not found");
        AppUser user=foundUser.get();
        Expense e=new Expense(); e.setUser(user); e.setAmount(r.getAmount()); e.setCategory(r.getCategory()); e.setDescription(r.getDescription()); e.setExpenseDate(r.getExpenseDate());
        Expense saved=expenses.save(e); alerts.checkBudgets(user); return saved;
    }
    public List<Expense> getByUser(Long userId){return expenses.findByUserId(userId);}
    public Expense get(Long id){java.util.Optional<Expense> found=expenses.findById(id); if(found.isEmpty()) throw new IllegalArgumentException("Expense not found"); return found.get();}
    public void delete(Long id){expenses.deleteById(id);}
}
