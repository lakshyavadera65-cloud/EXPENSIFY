package com.expensify.backend.repository;

import com.expensify.backend.model.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    @Query("SELECT r FROM RecurringExpense r WHERE r.user.id = :userId ORDER BY r.nextDueDate ASC")
    List<RecurringExpense> findByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM RecurringExpense r WHERE r.active = true AND r.nextDueDate <= :currentDate")
    List<RecurringExpense> findDueRecurringExpenses(@Param("currentDate") LocalDate currentDate);
}
