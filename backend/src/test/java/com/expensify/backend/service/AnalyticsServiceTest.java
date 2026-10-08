package com.expensify.backend.service;

import com.expensify.backend.dto.AnalyticsSummaryDTO;
import com.expensify.backend.dto.CategorySpendingDTO;
import com.expensify.backend.dto.MonthlySpendingDTO;
import com.expensify.backend.dto.PaymentMethodSpendingDTO;
import com.expensify.backend.enums.BudgetType;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.model.Budget;
import com.expensify.backend.repository.BudgetRepository;
import com.expensify.backend.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private final Long userId = 1L;
    private final LocalDate start = LocalDate.of(2026, 10, 1);
    private final LocalDate end = LocalDate.of(2026, 10, 31);

    @Test
    @DisplayName("Should correctly calculate executive analytics summary")
    void testGetSummary() {
        when(expenseRepository.getTotalSpent(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("15000.00"));
        when(expenseRepository.getTransactionCount(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(25L);

        Budget budget = new Budget();
        budget.setBudgetType(BudgetType.MONTHLY);
        budget.setLimitAmount(new BigDecimal("30000.00"));
        when(budgetRepository.findByUserId(userId)).thenReturn(List.of(budget));

        AnalyticsSummaryDTO summary = analyticsService.getSummary(userId, start, end);

        assertNotNull(summary);
        assertEquals(new BigDecimal("15000.00"), summary.getTotalSpending());
        assertEquals(25L, summary.getTransactionCount());
        assertEquals(new BigDecimal("30000.00"), summary.getTotalBudget());
        assertEquals(new BigDecimal("15000.00"), summary.getRemainingBudget());
        assertEquals(new BigDecimal("50.00"), summary.getBudgetUsedPercentage());
    }

    @Test
    @DisplayName("Should aggregate category spending and percentages")
    void testGetCategoryAnalytics() {
        when(expenseRepository.getTotalSpent(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("1000.00"));

        List<Object[]> raw = new ArrayList<>();
        raw.add(new Object[]{ExpenseCategory.FOOD, new BigDecimal("600.00"), 4L});
        raw.add(new Object[]{ExpenseCategory.TRAVEL, new BigDecimal("400.00"), 2L});

        when(expenseRepository.getCategorySpendingRaw(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(raw);

        List<CategorySpendingDTO> categories = analyticsService.getCategoryAnalytics(userId, start, end);

        assertNotNull(categories);
        assertFalse(categories.isEmpty());

        CategorySpendingDTO top = categories.get(0);
        assertEquals(ExpenseCategory.FOOD, top.getCategory());
        assertEquals(new BigDecimal("600.00"), top.getAmount());
        assertEquals(60.0, top.getPercentage());
    }

    @Test
    @DisplayName("Should aggregate payment method analytics and percentages")
    void testGetPaymentMethodAnalytics() {
        when(expenseRepository.getTotalSpent(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("2000.00"));

        List<Object[]> raw = new ArrayList<>();
        raw.add(new Object[]{ExpensePaymentMethod.UPI, new BigDecimal("1500.00"), 10L});
        raw.add(new Object[]{ExpensePaymentMethod.CREDIT_CARD, new BigDecimal("500.00"), 2L});

        when(expenseRepository.getPaymentMethodSpendingRaw(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(raw);

        List<PaymentMethodSpendingDTO> methods = analyticsService.getPaymentMethodAnalytics(userId, start, end);

        assertNotNull(methods);
        PaymentMethodSpendingDTO top = methods.get(0);
        assertEquals(ExpensePaymentMethod.UPI, top.getPaymentMethod());
        assertEquals(new BigDecimal("1500.00"), top.getAmount());
        assertEquals(75.0, top.getPercentage());
    }

    @Test
    @DisplayName("Should generate 12 monthly spending buckets for a given year")
    void testGetMonthlyAnalytics() {
        when(expenseRepository.getTotalSpent(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("5000.00"));
        when(expenseRepository.getTransactionCount(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(10L);

        List<MonthlySpendingDTO> months = analyticsService.getMonthlyAnalytics(userId, 2026);

        assertNotNull(months);
        assertEquals(12, months.size());
        assertEquals("Jan", months.get(0).getMonthName());
        assertEquals("Dec", months.get(11).getMonthName());
    }
}
