package com.expensify.backend.service;

import com.expensify.backend.dto.RecurringExpenseRequest;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.enums.RecurringFrequency;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Expense;
import com.expensify.backend.model.RecurringExpense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.ExpenseRepository;
import com.expensify.backend.repository.RecurringExpenseRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringExpenseServiceTest {

    @Mock
    private RecurringExpenseRepository recurringExpenseRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private BudgetAlertService budgetAlertService;

    @InjectMocks
    private RecurringExpenseService recurringExpenseService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setName("Lakshya");
    }

    @Test
    @DisplayName("Should successfully create a recurring expense")
    void testCreateRecurringExpense() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(i -> {
            RecurringExpense r = i.getArgument(0);
            r.setId(10L);
            return r;
        });

        RecurringExpenseRequest req = new RecurringExpenseRequest();
        req.setDescription("Fiber Internet");
        req.setAmount(new BigDecimal("1178.00"));
        req.setCategory(ExpenseCategory.BILLS);
        req.setPaymentMethod(ExpensePaymentMethod.UPI);
        req.setFrequency(RecurringFrequency.MONTHLY);
        req.setStartDate(LocalDate.now());

        RecurringExpense created = recurringExpenseService.create(1L, req);

        assertNotNull(created);
        assertEquals(10L, created.getId());
        assertTrue(created.isActive());
        assertEquals(new BigDecimal("1178.00"), created.getAmount());
    }

    @Test
    @DisplayName("Should pause and resume recurring expense")
    void testPauseAndResume() {
        RecurringExpense rec = new RecurringExpense();
        rec.setId(20L);
        rec.setUser(user);
        rec.setActive(true);
        rec.setNextDueDate(LocalDate.now().plusDays(5));

        when(recurringExpenseRepository.findById(20L)).thenReturn(Optional.of(rec));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(i -> i.getArgument(0));

        RecurringExpense paused = recurringExpenseService.pause(20L, 1L);
        assertFalse(paused.isActive());

        RecurringExpense resumed = recurringExpenseService.resume(20L, 1L);
        assertTrue(resumed.isActive());
    }

    @Test
    @DisplayName("Should generate actual expense when recurring item is due")
    void testProcessDueRecurringExpensesGeneratesExpense() {
        LocalDate today = LocalDate.now();
        RecurringExpense rec = new RecurringExpense();
        rec.setId(30L);
        rec.setUser(user);
        rec.setDescription("Gym Membership");
        rec.setAmount(new BigDecimal("2500.00"));
        rec.setCategory(ExpenseCategory.HEALTH);
        rec.setPaymentMethod(ExpensePaymentMethod.CREDIT_CARD);
        rec.setFrequency(RecurringFrequency.MONTHLY);
        rec.setNextDueDate(today);
        rec.setLastGeneratedDate(null); // Not yet generated

        List<RecurringExpense> dueList = new ArrayList<>();
        dueList.add(rec);

        when(recurringExpenseRepository.findDueRecurringExpenses(today)).thenReturn(dueList);

        int count = recurringExpenseService.processDueRecurringExpenses();

        assertEquals(1, count);
        verify(expenseRepository, times(1)).save(any(Expense.class));
        assertEquals(today, rec.getLastGeneratedDate());
        assertEquals(today.plusMonths(1), rec.getNextDueDate());
        verify(budgetAlertService, times(1)).checkBudgets(user);
    }

    @Test
    @DisplayName("CRITICAL: Must prevent duplicate expense creation if scheduler runs more than once for same due date")
    void testPreventDuplicateExpenseGeneration() {
        LocalDate today = LocalDate.now();
        RecurringExpense rec = new RecurringExpense();
        rec.setId(40L);
        rec.setUser(user);
        rec.setDescription("Cloud Storage");
        rec.setAmount(new BigDecimal("130.00"));
        rec.setCategory(ExpenseCategory.SUBSCRIPTIONS);
        rec.setPaymentMethod(ExpensePaymentMethod.UPI);
        rec.setFrequency(RecurringFrequency.MONTHLY);
        rec.setNextDueDate(today);
        rec.setLastGeneratedDate(today); // Already generated for today!

        List<RecurringExpense> dueList = List.of(rec);
        when(recurringExpenseRepository.findDueRecurringExpenses(today)).thenReturn(dueList);

        int count = recurringExpenseService.processDueRecurringExpenses();

        // Must NOT generate another expense
        assertEquals(0, count);
        verify(expenseRepository, never()).save(any(Expense.class));
        verify(budgetAlertService, never()).checkBudgets(any());
    }
}
