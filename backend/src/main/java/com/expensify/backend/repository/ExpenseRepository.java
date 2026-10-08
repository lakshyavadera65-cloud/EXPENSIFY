package com.expensify.backend.repository;

import com.expensify.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId ORDER BY e.expenseDate DESC, e.id DESC")
    List<Expense> findByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :from AND :to ORDER BY e.expenseDate DESC, e.id DESC")
    List<Expense> findByUserIdAndExpenseDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user.id = :userId
        AND e.expenseDate BETWEEN :startDate AND :endDate
        """)
    BigDecimal getTotalSpent(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COUNT(e)
        FROM Expense e
        WHERE e.user.id = :userId
        AND e.expenseDate BETWEEN :startDate AND :endDate
        """)
    Long getTransactionCount(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT e.category, COALESCE(SUM(e.amount), 0), COUNT(e)
        FROM Expense e
        WHERE e.user.id = :userId
        AND e.expenseDate BETWEEN :startDate AND :endDate
        GROUP BY e.category
        ORDER BY SUM(e.amount) DESC
        """)
    List<Object[]> getCategorySpendingRaw(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT e.paymentMethod, COALESCE(SUM(e.amount), 0), COUNT(e)
        FROM Expense e
        WHERE e.user.id = :userId
        AND e.expenseDate BETWEEN :startDate AND :endDate
        GROUP BY e.paymentMethod
        ORDER BY SUM(e.amount) DESC
        """)
    List<Object[]> getPaymentMethodSpendingRaw(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT e.expenseDate, COALESCE(SUM(e.amount), 0), COUNT(e)
        FROM Expense e
        WHERE e.user.id = :userId
        AND e.expenseDate BETWEEN :startDate AND :endDate
        GROUP BY e.expenseDate
        ORDER BY e.expenseDate ASC
        """)
    List<Object[]> getDailySpendingRaw(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
