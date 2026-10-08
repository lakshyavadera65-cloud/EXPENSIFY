package com.expensify.backend.service;
import com.expensify.backend.model.*; import com.expensify.backend.repository.*; import org.springframework.stereotype.Service; import java.math.BigDecimal; import java.math.RoundingMode; import java.time.LocalDate; import java.util.List;
@Service
public class BudgetAlertService {
    private final BudgetRepository budgets; private final ExpenseRepository expenses; private final NotificationRepository notifications;
    public BudgetAlertService(BudgetRepository b,ExpenseRepository e,NotificationRepository n){budgets=b;expenses=e;notifications=n;}
    public void checkBudgets(AppUser user){
        List<Budget> list=budgets.findByUserId(user.getId());
        for(Budget budget:list){
            LocalDate end=getEndDate(budget);
            List<Expense> expenseList=expenses.findByUserIdAndExpenseDateBetween(user.getId(),budget.getStartDate(),end);
            BigDecimal spent=BigDecimal.ZERO;
            for(Expense expense:expenseList){spent=spent.add(expense.getAmount());}
            if(budget.getLimitAmount()==null || budget.getLimitAmount().doubleValue()==0) continue;
            int percent=spent.multiply(new BigDecimal("100")).divide(budget.getLimitAmount(),0,RoundingMode.FLOOR).intValue();
            for(int threshold=80;threshold<=100;threshold+=5){
                String key=budget.getId()+":"+threshold;
                if(percent>=threshold && !notifications.existsByUserIdAndThreshold(user.getId(),key)){
                    Notification n=new Notification(); n.setUser(user); n.setTitle("Budget Alert"); n.setThreshold(key); n.setMessage("Your limit is "+threshold+"% reached"); notifications.save(n);
                }
            }
        }
    }
    private LocalDate getEndDate(Budget budget){
        if(budget.getBudgetType().name().equals("DAILY")) return budget.getStartDate();
        if(budget.getBudgetType().name().equals("WEEKLY")) return budget.getStartDate().plusDays(6);
        if(budget.getBudgetType().name().equals("MONTHLY")) return budget.getStartDate().plusMonths(1).minusDays(1);
        return budget.getStartDate().plusYears(1).minusDays(1);
    }
}
