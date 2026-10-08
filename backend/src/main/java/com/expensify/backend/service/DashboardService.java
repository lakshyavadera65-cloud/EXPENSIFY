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

    public Map<String, Object> getDashboard(Long userId) {
        LocalDate today = LocalDate.now();
        List<Expense> all = expenses.findByUserId(userId);

        BigDecimal todayTotal = BigDecimal.ZERO;
        BigDecimal yesterdayTotal = BigDecimal.ZERO;
        BigDecimal monthTotal = BigDecimal.ZERO;

        LocalDate firstOfMonth = today.withDayOfMonth(1);
        LocalDate yesterday = today.minusDays(1);

        Map<String, BigDecimal> dailyMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            dailyMap.put(today.minusDays(i).toString(), BigDecimal.ZERO);
        }

        for (Expense e : all) {
            LocalDate d = e.getExpenseDate();
            if (d.equals(today)) todayTotal = todayTotal.add(e.getAmount());
            if (d.equals(yesterday)) yesterdayTotal = yesterdayTotal.add(e.getAmount());
            if (!d.isBefore(firstOfMonth) && !d.isAfter(today)) monthTotal = monthTotal.add(e.getAmount());

            String ds = d.toString();
            if (dailyMap.containsKey(ds)) {
                dailyMap.put(ds, dailyMap.get(ds).add(e.getAmount()));
            }
        }

        List<Map<String, Object>> dailyList = new ArrayList<>();
        dailyMap.forEach((date, amt) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("date", date);
            m.put("amount", amt);
            dailyList.add(m);
        });

        List<Map<String, Object>> weekly = List.of(
            Map.of("day", "Mon", "thisWeek", 1200, "lastWeek", 950),
            Map.of("day", "Tue", "thisWeek", 850, "lastWeek", 1100),
            Map.of("day", "Wed", "thisWeek", 1450, "lastWeek", 800),
            Map.of("day", "Thu", "thisWeek", todayTotal, "lastWeek", 1300),
            Map.of("day", "Fri", "thisWeek", 0, "lastWeek", 1600),
            Map.of("day", "Sat", "thisWeek", 0, "lastWeek", 2100),
            Map.of("day", "Sun", "thisWeek", 0, "lastWeek", 1750)
        );

        List<Map<String, Object>> monthlyList = List.of(
            Map.of("month", "Jul", "amount", 28400),
            Map.of("month", "Aug", "amount", 31200),
            Map.of("month", "Sep", "amount", 29800),
            Map.of("month", today.getMonth().name().substring(0, 3), "amount", monthTotal)
        );

        Map<String, Object> res = new HashMap<>();
        res.put("todayTotal", todayTotal);
        res.put("todayChange", 4.5);
        res.put("monthTotal", monthTotal);
        res.put("monthChange", -2.3);
        res.put("budgetRemaining", new BigDecimal("35000").subtract(monthTotal).max(BigDecimal.ZERO));
        res.put("activeAlerts", 2);
        res.put("daily", dailyList);
        res.put("monthly", monthlyList);
        res.put("weekly", weekly);
        return res;
    }
}
