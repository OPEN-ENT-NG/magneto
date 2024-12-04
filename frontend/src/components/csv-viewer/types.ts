import { GridColDef } from "@mui/x-data-grid";

export interface CSVParserProps {
  resourceId: string;
  isCSV: boolean;
}

export interface GridDataType {
  rows: Array<{ id: number; [key: string]: string | number }>;
  columns: GridColDef[];
}

export interface SeparatorCount {
  separator: string;
  count: number;
}
export enum PAGE_SIZE_OPTIONS {
  FIVE = 5,
  TEN = 10,
  TWENTY_FIVE = 25,
  FIFTY = 50,
}

export interface GridDataType {
  rows: Array<{ id: number; [key: string]: string | number }>;
  columns: GridColDef[];
}
