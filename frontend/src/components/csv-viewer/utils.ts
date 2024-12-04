import { GridColDef } from "@mui/x-data-grid";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import { GridDataType, PAGE_SIZE_OPTIONS } from "./types";

export const convertExcelToCSV = (excelData: ArrayBuffer): string => {
  const workbook = XLSX.read(excelData, {
    type: "array",
    cellDates: true,
    cellNF: true,
    cellFormula: true,
  });

  const allSheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_csv(worksheet, {
      FS: ",",
      RS: "\n",
      dateNF: "YYYY-MM-DD",
      strip: true,
      blankrows: false,
    });
  });

  return allSheets.join("\n---\n");
};

export const parseCSV = (data: string): GridDataType => {
  const result = Papa.parse(data, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().replace(/"/g, ""),
  });

  const headers = result.meta.fields || [];
  const columns: GridColDef[] = headers.map((header) => ({
    field: header,
    headerName: header,
    flex: 1,
    minWidth: 150,
  }));

  const rows = result.data.map((row: any, index: number) => ({
    id: index,
    ...row,
  }));

  return { rows, columns };
};

export const pageSizeOptions = [
  PAGE_SIZE_OPTIONS.FIVE,
  PAGE_SIZE_OPTIONS.TEN,
  PAGE_SIZE_OPTIONS.TWENTY_FIVE,
  PAGE_SIZE_OPTIONS.FIFTY,
];

export const DATAGRID_KEYS = {
  ROWS_DISPLAYED: "magneto.datagrid.rows.displayed",
  ROWS_PER_PAGE: "magneto.datagrid.rows.per.page",
} as const;
