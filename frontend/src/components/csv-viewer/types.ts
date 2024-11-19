import { GridColDef } from "@mui/x-data-grid";

export interface CSVParserProps {
  ressourceId: string;
}

export interface GridDataType {
  rows: Array<{ id: number; [key: string]: string | number }>;
  columns: GridColDef[];
}

export interface SeparatorCount {
  separator: string;
  count: number;
}
