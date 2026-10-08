package com.expensify.backend.enums;

public enum ExpensePaymentMethod {
    CASH,
    UPI,
    CREDIT_CARD,
    DEBIT_CARD,
    BANK_TRANSFER,
    WALLET,
    OTHER;

    /**
     * Parses a string representation of payment method safely into an enum constant,
     * defaulting to OTHER if unrecognized or null.
     */
    public static ExpensePaymentMethod fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (ExpensePaymentMethod m : values()) {
            if (m.name().equalsIgnoreCase(normalized)) {
                return m;
            }
        }
        return OTHER;
    }
}
