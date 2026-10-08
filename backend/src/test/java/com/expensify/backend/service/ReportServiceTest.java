package com.expensify.backend.service;

import com.expensify.backend.dto.AnalyticsSummaryDTO;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.enums.UserRole;
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
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private ReportService reportService;

    private AppUser user;
    private final LocalDate start = LocalDate.of(2026, 10, 1);
    private final LocalDate end = LocalDate.of(2026, 10, 31);

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setName("Lakshya Vadera");
        user.setEmail("lakshya@expensify.app");
        user.setRole(UserRole.CUSTOMER);
        user.setCity("Bengaluru");
    }

    @Test
    @DisplayName("Should generate valid CSV report with header and rows")
    void testGenerateCsvReport() {
        Expense e1 = new Expense();
        e1.setExpenseDate(LocalDate.of(2026, 10, 5));
        e1.setDescription("Groceries");
        e1.setAmount(new BigDecimal("1200.00"));
        e1.setCategory(ExpenseCategory.FOOD);
        e1.setPaymentMethod(ExpensePaymentMethod.UPI);

        when(expenseRepository.findByUserIdAndExpenseDateBetween(1L, start, end))
                .thenReturn(List.of(e1));

        byte[] csvBytes = reportService.generateCsvReport(1L, start, end);

        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvContent.contains("Date,Description,Amount (INR),Category,Payment Method"));
        assertTrue(csvContent.contains("2026-10-05"));
        assertTrue(csvContent.contains("Groceries"));
        assertTrue(csvContent.contains("1200.00"));
        assertTrue(csvContent.contains("FOOD"));
        assertTrue(csvContent.contains("UPI"));
    }

    @Test
    @DisplayName("Should generate valid binary PDF report starting with %PDF")
    void testGeneratePdfReport() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(expenseRepository.findByUserIdAndExpenseDateBetween(1L, start, end))
                .thenReturn(Collections.emptyList());

        AnalyticsSummaryDTO summary = new AnalyticsSummaryDTO();
        summary.setTotalSpending(new BigDecimal("5000.00"));
        summary.setTransactionCount(5L);
        when(analyticsService.getSummary(eq(1L), any(), any())).thenReturn(summary);
        when(analyticsService.getCategoryAnalytics(eq(1L), any(), any())).thenReturn(Collections.emptyList());
        when(analyticsService.getPaymentMethodAnalytics(eq(1L), any(), any())).thenReturn(Collections.emptyList());

        byte[] pdfBytes = reportService.generatePdfReport(1L, start, end);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 100);

        // Verify PDF Magic Bytes (%PDF)
        String header = new String(pdfBytes, 0, 4, StandardCharsets.US_ASCII);
        assertEquals("%PDF", header);
    }
}
