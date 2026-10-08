package com.expensify.backend.enums;

public enum ExpenseCategory {
    FOOD,
    TRAVEL,
    SHOPPING,
    BILLS,
    ENTERTAINMENT,
    HEALTH,
    EDUCATION,
    RENT,
    GROCERIES,
    SUBSCRIPTIONS,
    OTHER;

    /**
     * Parses a string representation of category safely into an enum constant,
     * defaulting to OTHER if unrecognized or null.
     */
    public static ExpenseCategory fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (ExpenseCategory c : values()) {
            if (c.name().equalsIgnoreCase(normalized)) {
                return c;
            }
        }
        return OTHER;
    }
}
