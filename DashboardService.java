package com.expensify.backend.service;
import com.expensify.backend.model.Expense; import com.expensify.backend.repository.ExpenseRepository; import org.springframework.stereotype.Service; import java.math.BigDecimal; import java.time.LocalDate; import java.util.*;
@Service
public class DashboardService {
    private final ExpenseRepository expenses;
    public DashboardService(ExpenseRepository expenses){this.expenses=expenses;}
    public Map<String,Object> daily(Long userId){
        LocalDate today=LocalDate.now(); List<Expense> list=expenses.findByUserIdAndExpenseDateBetween(userId,today,today);
        BigDecimal total=BigDecimal.ZERO; Map<String,BigDecimal> categories=new HashMap<>();
        for(Expense e:list){ total=total.add(e.getAmount()); BigDecimal old=categories.get(e.getCategory()); if(old==null) old=BigDecimal.ZERO; categories.put(e.getCategory(),old.add(e.getAmount())); }
        Map<String,Object> result=new HashMap<>(); result.put("date",today); result.put("totalSpent",total); result.put("categoryTotals",categories); return result;
    }
    public Map<String,BigDecimal> monthly(Long userId){
        LocalDate from=LocalDate.now().withDayOfMonth(1); LocalDate to=from.plusMonths(1).minusDays(1); List<Expense> list=expenses.findByUserIdAndExpenseDateBetween(userId,from,to); Map<String,BigDecimal> result=new HashMap<>();
        for(Expense e:list){String day=e.getExpenseDate().toString(); BigDecimal old=result.get(day); if(old==null) old=BigDecimal.ZERO; result.put(day,old.add(e.getAmount()));} return result;
    }
}
