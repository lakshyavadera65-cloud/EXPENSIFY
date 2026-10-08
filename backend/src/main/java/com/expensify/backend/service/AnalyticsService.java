package com.expensify.backend.service;

import com.expensify.backend.dto.*;
import com.expensify.backend.enums.BudgetType;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.model.Budget;
import com.expensify.backend.repository.BudgetRepository;
import com.expensify.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class AnalyticsService {
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public AnalyticsService(ExpenseRepository expenseRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public AnalyticsSummaryDTO getSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (startDate == null) startDate = today.withDayOfMonth(1);
        if (endDate == null) endDate = today;

        AnalyticsSummaryDTO dto = new AnalyticsSummaryDTO();

        // 1. Range totals
        BigDecimal totalSpent = expenseRepository.getTotalSpent(userId, startDate, endDate);
        Long totalTransactions = expenseRepository.getTransactionCount(userId, startDate, endDate);
        dto.setTotalSpending(totalSpent);
        dto.setTransactionCount(totalTransactions);

        // 2. Today's spending
        BigDecimal todaySpent = expenseRepository.getTotalSpent(userId, today, today);
        dto.setTodaySpending(todaySpent);

        // 3. This week's spending (Monday to Sunday)
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        dto.setThisWeekSpending(expenseRepository.getTotalSpent(userId, weekStart, weekEnd));

        // 4. This month's spending
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());
        dto.setThisMonthSpending(expenseRepository.getTotalSpent(userId, monthStart, monthEnd));

        // 5. This year's spending
        LocalDate yearStart = today.withDayOfYear(1);
        LocalDate yearEnd = today.with(TemporalAdjusters.lastDayOfYear());
        dto.setThisYearSpending(expenseRepository.getTotalSpent(userId, yearStart, yearEnd));

        // 6. Average daily spending
        long days = Math.max(1, ChronoUnit.DAYS.between(startDate, endDate) + 1);
        BigDecimal avgDaily = totalSpent.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
        dto.setAverageDailySpending(avgDaily);

        // 7. Highest category & highest day
        List<CategorySpendingDTO> categories = getCategoryAnalytics(userId, startDate, endDate);
        if (!categories.isEmpty() && categories.get(0).getAmount().compareTo(BigDecimal.ZERO) > 0) {
            dto.setHighestSpendingCategory(categories.get(0).getCategoryName());
        }

        List<DailySpendingDTO> daily = getDailyAnalytics(userId, startDate, endDate);
        DailySpendingDTO maxDay = daily.stream()
                .max(Comparator.comparing(DailySpendingDTO::getAmount))
                .orElse(null);
        if (maxDay != null && maxDay.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            dto.setHighestSpendingDay(maxDay.getDate().toString() + " (" + maxDay.getAmount() + ")");
        }

        // 8. Budget utilization
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        Budget monthlyBudget = budgets.stream()
                .filter(b -> b.getBudgetType() == BudgetType.MONTHLY)
                .findFirst()
                .orElse(null);

        if (monthlyBudget != null && monthlyBudget.getLimitAmount() != null && monthlyBudget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal limit = monthlyBudget.getLimitAmount();
            dto.setTotalBudget(limit);
            BigDecimal spentThisMonth = dto.getThisMonthSpending();
            BigDecimal remaining = limit.subtract(spentThisMonth);
            dto.setRemainingBudget(remaining.compareTo(BigDecimal.ZERO) >= 0 ? remaining : BigDecimal.ZERO);
            BigDecimal pct = spentThisMonth.multiply(BigDecimal.valueOf(100)).divide(limit, 2, RoundingMode.HALF_UP);
            dto.setBudgetUsedPercentage(pct);
        }

        return dto;
    }

    public List<CategorySpendingDTO> getCategoryAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        BigDecimal total = expenseRepository.getTotalSpent(userId, startDate, endDate);
        List<Object[]> rawList = expenseRepository.getCategorySpendingRaw(userId, startDate, endDate);

        Map<ExpenseCategory, CategorySpendingDTO> map = new LinkedHashMap<>();
        for (ExpenseCategory c : ExpenseCategory.values()) {
            map.put(c, new CategorySpendingDTO(c, BigDecimal.ZERO, 0L));
        }

        for (Object[] row : rawList) {
            ExpenseCategory cat = (ExpenseCategory) row[0];
            if (cat == null) cat = ExpenseCategory.OTHER;
            BigDecimal amount = (BigDecimal) row[1];
            Long count = (Long) row[2];

            CategorySpendingDTO dto = map.get(cat);
            if (dto != null) {
                dto.setAmount(amount);
                dto.setTransactionCount(count);
                if (total.compareTo(BigDecimal.ZERO) > 0) {
                    double pct = amount.multiply(BigDecimal.valueOf(100))
                            .divide(total, 2, RoundingMode.HALF_UP)
                            .doubleValue();
                    dto.setPercentage(pct);
                }
            }
        }

        List<CategorySpendingDTO> result = new ArrayList<>(map.values());
        result.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return result;
    }

    public List<PaymentMethodSpendingDTO> getPaymentMethodAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        BigDecimal total = expenseRepository.getTotalSpent(userId, startDate, endDate);
        List<Object[]> rawList = expenseRepository.getPaymentMethodSpendingRaw(userId, startDate, endDate);

        Map<ExpensePaymentMethod, PaymentMethodSpendingDTO> map = new LinkedHashMap<>();
        for (ExpensePaymentMethod m : ExpensePaymentMethod.values()) {
            map.put(m, new PaymentMethodSpendingDTO(m, BigDecimal.ZERO, 0L));
        }

        for (Object[] row : rawList) {
            ExpensePaymentMethod method = (ExpensePaymentMethod) row[0];
            if (method == null) method = ExpensePaymentMethod.OTHER;
            BigDecimal amount = (BigDecimal) row[1];
            Long count = (Long) row[2];

            PaymentMethodSpendingDTO dto = map.get(method);
            if (dto != null) {
                dto.setAmount(amount);
                dto.setTransactionCount(count);
                if (total.compareTo(BigDecimal.ZERO) > 0) {
                    double pct = amount.multiply(BigDecimal.valueOf(100))
                            .divide(total, 2, RoundingMode.HALF_UP)
                            .doubleValue();
                    dto.setPercentage(pct);
                }
            }
        }

        List<PaymentMethodSpendingDTO> result = new ArrayList<>(map.values());
        result.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return result;
    }

    public List<DailySpendingDTO> getDailyAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (startDate == null) startDate = today.minusDays(29);
        if (endDate == null) endDate = today;

        List<Object[]> rawList = expenseRepository.getDailySpendingRaw(userId, startDate, endDate);
        Map<LocalDate, DailySpendingDTO> map = new HashMap<>();
        for (Object[] row : rawList) {
            LocalDate date = (LocalDate) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            Long count = (Long) row[2];
            map.put(date, new DailySpendingDTO(date, amount, count));
        }

        List<DailySpendingDTO> result = new ArrayList<>();
        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            if (map.containsKey(curr)) {
                result.add(map.get(curr));
            } else {
                result.add(new DailySpendingDTO(curr, BigDecimal.ZERO, 0L));
            }
            curr = curr.plusDays(1);
        }
        return result;
    }

    public List<MonthlySpendingDTO> getMonthlyAnalytics(Long userId, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<MonthlySpendingDTO> list = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            LocalDate start = LocalDate.of(targetYear, m, 1);
            LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());
            BigDecimal amount = expenseRepository.getTotalSpent(userId, start, end);
            Long count = expenseRepository.getTransactionCount(userId, start, end);
            String monthName = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            list.add(new MonthlySpendingDTO(targetYear, m, monthName, amount, count));
        }
        return list;
    }
}
