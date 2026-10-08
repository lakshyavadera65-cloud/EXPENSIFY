package com.expensify.backend.service;

import com.expensify.backend.dto.AnalyticsSummaryDTO;
import com.expensify.backend.dto.CategorySpendingDTO;
import com.expensify.backend.dto.PaymentMethodSpendingDTO;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Expense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.ExpenseRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {
    private final ExpenseRepository expenseRepository;
    private final AppUserRepository userRepository;
    private final AnalyticsService analyticsService;

    public ReportService(ExpenseRepository expenseRepository,
                         AppUserRepository userRepository,
                         AnalyticsService analyticsService) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }

    public byte[] generateCsvReport(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        List<Expense> expenses = expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

        // CSV Header
        writer.println("Date,Description,Amount (INR),Category,Payment Method");

        for (Expense e : expenses) {
            String date = e.getExpenseDate() != null ? e.getExpenseDate().toString() : "";
            String desc = escapeCsv(e.getDescription() != null ? e.getDescription() : e.getTitle());
            String amount = e.getAmount() != null ? e.getAmount().toString() : "0.00";
            String category = e.getCategory() != null ? e.getCategory().name() : "OTHER";
            String paymentMethod = e.getPaymentMethod() != null ? e.getPaymentMethod().name() : "OTHER";

            writer.printf("%s,%s,%s,%s,%s%n", date, desc, amount, category, paymentMethod);
        }

        writer.flush();
        return baos.toByteArray();
    }

    public byte[] generatePdfReport(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<Expense> expenses = expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate);
        AnalyticsSummaryDTO summary = analyticsService.getSummary(userId, startDate, endDate);
        List<CategorySpendingDTO> categories = analyticsService.getCategoryAnalytics(userId, startDate, endDate);
        List<PaymentMethodSpendingDTO> payments = analyticsService.getPaymentMethodAnalytics(userId, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Color Palette
            Color primaryColor = new Color(255, 122, 0); // EXPENSIFY Orange #FF7A00
            Color headerBg = new Color(30, 41, 59);     // Slate 800
            Color lightGray = new Color(241, 245, 249);  // Slate 100
            Color darkText = new Color(15, 23, 42);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font h2Font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, darkText);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 9, darkText);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);

            // Document Header
            Paragraph title = new Paragraph("EXPENSIFY EXPENSE REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph meta = new Paragraph("Smart Financial Management & Audit Ledger", subtitleFont);
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingAfter(15);
            document.add(meta);

            // User & Period Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            addInfoCell(infoTable, "User: " + user.getName() + " (" + user.getEmail() + ")", regularFont);
            addInfoCell(infoTable, "Generated: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), regularFont);
            addInfoCell(infoTable, "Period: " + startDate + " to " + endDate, regularFont);
            addInfoCell(infoTable, "Role: " + user.getRole().name() + " | City: " + (user.getCity() != null ? user.getCity() : "N/A"), regularFont);
            document.add(infoTable);

            // Executive Summary KPIs
            document.add(new Paragraph("Financial Overview", h2Font));
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingBefore(6);
            kpiTable.setSpacingAfter(15);

            addKpiCell(kpiTable, "Total Spending", "₹" + summary.getTotalSpending(), primaryColor, boldFont, regularFont);
            addKpiCell(kpiTable, "Transactions", String.valueOf(summary.getTransactionCount()), headerBg, boldFont, regularFont);
            addKpiCell(kpiTable, "Daily Average", "₹" + summary.getAverageDailySpending(), headerBg, boldFont, regularFont);
            addKpiCell(kpiTable, "Budget Utilization", summary.getBudgetUsedPercentage() + "%", primaryColor, boldFont, regularFont);
            document.add(kpiTable);

            // Category & Payment Method Split (side-by-side or stacked)
            document.add(new Paragraph("Category & Payment Analytics", h2Font));
            PdfPTable splitTable = new PdfPTable(2);
            splitTable.setWidthPercentage(100);
            splitTable.setSpacingBefore(6);
            splitTable.setSpacingAfter(15);

            // Left: Top Categories
            PdfPCell catCell = new PdfPCell();
            catCell.setBorder(Rectangle.NO_BORDER);
            catCell.setPadding(4);
            PdfPTable catTable = new PdfPTable(3);
            catTable.setWidthPercentage(100);
            addTableHeader(catTable, "Category", headerFont, headerBg);
            addTableHeader(catTable, "Amount", headerFont, headerBg);
            addTableHeader(catTable, "Share", headerFont, headerBg);
            for (CategorySpendingDTO c : categories.subList(0, Math.min(5, categories.size()))) {
                if (c.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                    addTableCell(catTable, c.getCategoryName(), regularFont, false);
                    addTableCell(catTable, "₹" + c.getAmount(), regularFont, false);
                    addTableCell(catTable, c.getPercentage() + "%", regularFont, false);
                }
            }
            catCell.addElement(catTable);
            splitTable.addCell(catCell);

            // Right: Payment Methods
            PdfPCell pmCell = new PdfPCell();
            pmCell.setBorder(Rectangle.NO_BORDER);
            pmCell.setPadding(4);
            PdfPTable pmTable = new PdfPTable(3);
            pmTable.setWidthPercentage(100);
            addTableHeader(pmTable, "Method", headerFont, headerBg);
            addTableHeader(pmTable, "Amount", headerFont, headerBg);
            addTableHeader(pmTable, "Share", headerFont, headerBg);
            for (PaymentMethodSpendingDTO p : payments) {
                if (p.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                    addTableCell(pmTable, p.getPaymentMethodName(), regularFont, false);
                    addTableCell(pmTable, "₹" + p.getAmount(), regularFont, false);
                    addTableCell(pmTable, p.getPercentage() + "%", regularFont, false);
                }
            }
            pmCell.addElement(pmTable);
            splitTable.addCell(pmCell);

            document.add(splitTable);

            // Detailed Expense Ledger Table
            document.add(new Paragraph("Detailed Expense Ledger (" + expenses.size() + " records)", h2Font));
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.2f, 4.5f, 2.8f, 2.5f, 2.5f});
            table.setSpacingBefore(6);

            addTableHeader(table, "Date", headerFont, headerBg);
            addTableHeader(table, "Description", headerFont, headerBg);
            addTableHeader(table, "Category", headerFont, headerBg);
            addTableHeader(table, "Payment", headerFont, headerBg);
            addTableHeader(table, "Amount (₹)", headerFont, headerBg);

            boolean alt = false;
            for (Expense e : expenses) {
                Color rowBg = alt ? lightGray : Color.WHITE;
                addStyledCell(table, e.getExpenseDate() != null ? e.getExpenseDate().toString() : "", regularFont, rowBg);
                addStyledCell(table, e.getDescription() != null ? e.getDescription() : e.getTitle(), regularFont, rowBg);
                addStyledCell(table, e.getCategory() != null ? e.getCategory().name() : "OTHER", regularFont, rowBg);
                addStyledCell(table, e.getPaymentMethod() != null ? e.getPaymentMethod().name() : "OTHER", regularFont, rowBg);
                addStyledCell(table, "₹" + (e.getAmount() != null ? e.getAmount() : "0.00"), boldFont, rowBg);
                alt = !alt;
            }

            document.add(table);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, boolean center) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        if (center) cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addStyledCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addInfoCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(2);
        table.addCell(cell);
    }

    private void addKpiCell(PdfPTable table, String label, String value, Color accent, Font valFont, Font lblFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setBorderColor(new Color(226, 232, 240));

        Paragraph val = new Paragraph(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, accent));
        Paragraph lbl = new Paragraph(label, lblFont);
        cell.addElement(lbl);
        cell.addElement(val);
        table.addCell(cell);
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        if (input.contains(",") || input.contains("\"") || input.contains("\n")) {
            return "\"" + input.replace("\"", "\"\"") + "\"";
        }
        return input;
    }
}
