package com.expensify.backend.repository;
import com.expensify.backend.model.Budget;
import com.expensify.backend.enums.BudgetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId")
    List<Budget> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.budgetType = :type")
    Optional<Budget> findByUserIdAndBudgetType(@Param("userId") Long userId, @Param("type") BudgetType type);
}
