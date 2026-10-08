package com.expensify.backend.repository;
import com.expensify.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.user.id = :userId AND n.threshold = :threshold")
    boolean existsByUserIdAndThreshold(@Param("userId") Long userId, @Param("threshold") String threshold);
}
