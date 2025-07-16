package com.aptiv.internship.util;

import com.aptiv.internship.dto.request.InternRequest;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;

import static org.apache.poi.ss.usermodel.CellType.*;

@Component
public class ExcelParser {

    public List<InternRequest> parseInterns(MultipartFile file) throws IOException {
        List<InternRequest> requests = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0); // Use the first sheet
            Iterator<Row> rows = sheet.iterator();
            if (!rows.hasNext()) {
                throw new IllegalArgumentException("Excel file is empty");
            }

            Row headerRow = rows.next(); // First row is the header
            List<String> headers = getHeaders(headerRow);

            while (rows.hasNext()) {
                Row row = rows.next();
                InternRequest request = mapRowToRequest(row, headers);
                if (request != null) {
                    requests.add(request);
                }
            }
        }
        return requests;
    }

    private List<String> getHeaders(Row headerRow) {
        List<String> headers = new ArrayList<>();
        for (Cell cell : headerRow) {
            headers.add(cell.getStringCellValue().trim().toLowerCase());
        }
        return headers;
    }

    private InternRequest mapRowToRequest(Row row, List<String> headers) {
        InternRequest request = new InternRequest();
        for (int i = 0; i < headers.size(); i++) {
            Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            String header = headers.get(i).trim().toLowerCase();
            String cellValue = getCellValueAsString(cell);

            switch (header) {
                case "first name":
                    if (cellValue.isEmpty()) {
                        throw new IllegalArgumentException("First name is required in row " + (row.getRowNum() + 1));
                    }
                    request.setFirstName(cellValue);
                    break;
                case "last name":
                    request.setLastName(cellValue); // Optional
                    break;
                case "email":
                    request.setEmail(cellValue); // Optional
                    break;
                case "phone":
                    request.setPhone(cellValue); // Optional
                    break;
                case "university":
                    request.setUniversity(cellValue); // Optional
                    break;
                case "major":
                    request.setMajor(cellValue); // Optional
                    break;
                case "start date":
                    if (cellValue.isEmpty()) {
                        throw new IllegalArgumentException("Start date is required in row " + (row.getRowNum() + 1));
                    }
                    try {
                        request.setStartDate(LocalDate.parse(cellValue));
                    } catch (DateTimeParseException e) {
                        throw new IllegalArgumentException("Invalid start date format in row " + (row.getRowNum() + 1));
                    }
                    break;
                case "end date":
                    if (cellValue.isEmpty()) {
                        throw new IllegalArgumentException("End date is required in row " + (row.getRowNum() + 1));
                    }
                    try {
                        request.setEndDate(LocalDate.parse(cellValue));
                    } catch (DateTimeParseException e) {
                        throw new IllegalArgumentException("Invalid end date format in row " + (row.getRowNum() + 1));
                    }
                    break;
                case "supervisor":
                    request.setSupervisor(cellValue); // Optional
                    break;
                case "department":
                    if (cellValue.isEmpty()) {
                        throw new IllegalArgumentException("Department is required in row " + (row.getRowNum() + 1));
                    }
                    request.setDepartment(cellValue);
                    break;
                default:
                    // Ignore unrecognized headers
            }
        }
        return request;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return ""; // Return empty string for null cells
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim(); // Extract string values
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString(); // Handle dates
                }
                return String.valueOf(cell.getNumericCellValue()); // Handle numbers
            case BLANK:
                return ""; // Return empty string for blank cells
            default:
                return ""; // Fallback for unhandled types
        }
    }
}