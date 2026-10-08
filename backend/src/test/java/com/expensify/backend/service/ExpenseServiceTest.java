package com.expensify.backend.service;

import com.expensify.backend.dto.ExpenseRequest;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Expense;
import com.expensify.backend.repository.AppUserRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private BudgetAlertService budgetAlertService;

    @InjectMocks
    private ExpenseService expenseService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setName("Lakshya");
        user.setEmail("lakshya@expensify.app");
    }

    @Test
    @DisplayName("Should successfully create an expense with category and payment method")
    void testCreateExpenseSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense e = invocation.getArgument(0);
            e.setId(100L);
            return e;
        });

        ExpenseRequest req = new ExpenseRequest();
        req.setAmount(new BigDecimal("850.00"));
        req.setCategory(ExpenseCategory.FOOD);
        req.setPaymentMethod(ExpensePaymentMethod.UPI);
        req.setDescription("Dinner with team");
        req.setExpenseDate(LocalDate.now());

        Expense created = expenseService.add(1L, req);

        assertNotNull(created);
        assertEquals(100L, created.getId());
        assertEquals(new BigDecimal("850.00"), created.getAmount());
        assertEquals(ExpenseCategory.FOOD, created.getCategory());
        assertEquals(ExpensePaymentMethod.UPI, created.getPaymentMethod());
        assertEquals("Dinner with team", created.getDescription());
        verify(budgetAlertService, times(1)).checkBudgets(user);
    }

    @Test
    @DisplayName("Should throw exception when creating expense with invalid (negative/zero) amount")
    void testCreateExpenseInvalidAmount() {
        ExpenseRequest req = new ExpenseRequest();
        req.setAmount(new BigDecimal("-50.00"));

        assertThrows(IllegalArgumentException.class, () -> expenseService.add(1L, req));
        verify(expenseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should safely parse string category and payment method with fallback")
    void testCategoryAndPaymentMethodFallback() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));

        ExpenseRequest req = new ExpenseRequest();
        req.setAmount(new BigDecimal("200.00"));
        req.setCategory("Unknown Category");
        req.setPaymentMethod("NonExistentMethod");

        Expense created = expenseService.add(1L, req);
        assertEquals(ExpenseCategory.OTHER, created.getCategory());
        assertEquals(ExpensePaymentMethod.OTHER, created.getPaymentMethod());
    }

    @Test
    @DisplayName("Should update expense details successfully")
    void testUpdateExpense() {
        Expense existing = new Expense();
        existing.setId(5L);
        existing.setUser(user);
        existing.setAmount(new BigDecimal("100.00"));
        existing.setCategory(ExpenseCategory.FOOD);
        existing.setPaymentMethod(ExpensePaymentMethod.CASH);

        when(expenseRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));

        ExpenseRequest updateReq = new ExpenseRequest();
        updateReq.setAmount(new BigDecimal("150.00"));
        updateReq.setCategory(ExpenseCategory.TRAVEL);
        updateReq.setPaymentMethod(ExpensePaymentMethod.CREDIT_CARD);

        Expense updated = expenseService.update(5L, updateReq, 1L);

        assertEquals(new BigDecimal("150.00"), updated.getAmount());
        assertEquals(ExpenseCategory.TRAVEL, updated.getCategory());
        assertEquals(ExpensePaymentMethod.CREDIT_CARD, updated.getPaymentMethod());
    }

    @Test
    @DisplayName("Should delete expense by ID")
    void testDeleteExpense() {
        expenseService.delete(10L);
        verify(expenseRepository, times(1)).deleteById(10L);
    }
}
