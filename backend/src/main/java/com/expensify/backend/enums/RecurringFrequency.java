package com.expensify.backend.enums;

public enum RecurringFrequency {
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY;

    public static RecurringFrequency fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MONTHLY;
        }
        String normalized = value.trim().toUpperCase();
        for (RecurringFrequency f : values()) {
            if (f.name().equalsIgnoreCase(normalized)) {
                return f;
            }
        }
        return MONTHLY;
    }
}
