package com.aptiv.internship.util;

import com.aptiv.internship.entity.Activity;
import com.aptiv.internship.entity.Intern;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ReportGenerator {
    public static byte[] generateActivityReport(Intern intern, List<Activity> activities) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            Paragraph title = new Paragraph("Intern Activity Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            // Add intern information
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("Intern Information:", headerFont));
            document.add(new Paragraph("Name: " + intern.getFirstName() + " " + intern.getLastName(), normalFont));
            document.add(new Paragraph("Email: " + intern.getEmail(), normalFont));
            document.add(new Paragraph("University: " + intern.getUniversity(), normalFont));
            document.add(new Paragraph("Department: " + intern.getDepartment(), normalFont));
            document.add(new Paragraph("Supervisor: " + intern.getSupervisor(), normalFont));
            document.add(new Paragraph("Period: " +
                    intern.getStartDate().format(DateTimeFormatter.ISO_DATE) + " to " +
                    intern.getEndDate().format(DateTimeFormatter.ISO_DATE), normalFont));

            document.add(Chunk.NEWLINE);

            // Add activities table
            document.add(new Paragraph("Daily Activities:", headerFont));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Table headers
            PdfPCell dateHeader = new PdfPCell(new Phrase("Date", headerFont));
            dateHeader.setBackgroundColor(new Color(220, 220, 220));
            dateHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(dateHeader);

            PdfPCell activityHeader = new PdfPCell(new Phrase("Activities", headerFont));
            activityHeader.setBackgroundColor(new Color(220, 220, 220));
            activityHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(activityHeader);

            // Table data
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (Activity activity : activities) {
                table.addCell(new Phrase(activity.getActivityDate().format(dateFormatter), normalFont));
                table.addCell(new Phrase(activity.getDescription(), normalFont));
            }

            document.add(table);

            // Add footer
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
            Paragraph footer = new Paragraph("Generated on " + java.time.LocalDate.now(), footerFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF report", e);
        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }
}