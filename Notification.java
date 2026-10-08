package com.expensify.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private AppUser user;
    private String title;
    private String message;
    private String threshold;
    private boolean readStatus;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String value) { this.title = value; }
    public String getMessage() { return message; }
    public void setMessage(String value) { this.message = value; }
    public String getThreshold() { return threshold; }
    public void setThreshold(String value) { this.threshold = value; }
    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean value) { this.readStatus = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime value) { this.createdAt = value; }
}
