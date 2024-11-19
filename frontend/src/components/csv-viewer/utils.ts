import { GridColDef } from "@mui/x-data-grid";

import { GridDataType } from "./types";

const detectSeparator = (line: string): string => {
  const separators = [";", ",", "\t", "|"];
  const counts = separators.map((sep) => ({
    separator: sep,
    count: line.split(sep).length,
  }));
  return counts.reduce((max, curr) => (curr.count > max.count ? curr : max))
    .separator;
};

export const parseCSV = (data: string): GridDataType => {
  const lines: string[] = data.split("\n");
  const separator: string = detectSeparator(lines[0]);
  const headerMappings: Record<string, string> = {};
  const headers: string[] = lines[0]
    .split(separator)
    .filter((header: string) => header.trim())
    .map((header: string, index: number) => {
      const cleanHeader = header.trim().replace(/"/g, "");
      const uniqueField = `${cleanHeader}_${index}`;
      headerMappings[uniqueField] = cleanHeader;
      return uniqueField;
    });

  const columns: GridColDef[] = headers.map((uniqueField: string) => ({
    field: uniqueField,
    headerName: headerMappings[uniqueField],
    flex: 1,
    minWidth: 150,
  }));

  const rows = lines
    .slice(1)
    .filter((line: string) => line.trim())
    .map((line: string, index: number) => {
      const values = line.split(separator);
      return {
        id: index,
        ...headers.reduce<Record<string, string>>(
          (obj: Record<string, string>, uniqueField: string, idx: number) => {
            obj[uniqueField] = values[idx]?.trim().replace(/"/g, "") || "";
            return obj;
          },
          {},
        ),
      };
    });

  return { rows, columns };
};
