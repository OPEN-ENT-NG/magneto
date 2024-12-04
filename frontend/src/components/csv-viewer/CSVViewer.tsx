import { FC, useEffect, useState } from "react";

import { LabelDisplayedRowsArgs } from "@mui/material/TablePagination";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

import { gridStyle } from "./style";
import { CSVParserProps, GridDataType, PAGE_SIZE_OPTIONS } from "./types";
import {
  convertExcelToCSV,
  DATAGRID_KEYS,
  pageSizeOptions,
  parseCSV,
} from "./utils";
import { useGetRessourceQuery } from "~/services/api/workspace.service";

const CSVParser: FC<CSVParserProps> = ({ resourceId, isCSV }) => {
  const { data } = useGetRessourceQuery(
    { visibility: false, id: resourceId },
    { skip: !resourceId || !isCSV },
  );
  const { t } = useTranslation("magneto");
  const [gridData, setGridData] = useState<GridDataType>({
    rows: [],
    columns: [],
  });
  const processData = async () => {
    if (isCSV && data) {
      setGridData(parseCSV(data));
    } else if (!isCSV && resourceId) {
      try {
        const response = await fetch(`/workspace/document/${resourceId}`);
        const excelData = await response.arrayBuffer();
        const csvData = convertExcelToCSV(excelData);
        setGridData(parseCSV(csvData));
      } catch (error) {
        console.error("Error fetching or converting Excel file:", error);
      }
    }
  };
  useEffect(() => {
    processData();
  }, [data, resourceId, isCSV]);

  return (
    <DataGrid
      autoHeight
      autosizeOptions={{
        includeOutliers: true,
        includeHeaders: false,
      }}
      {...gridData}
      initialState={{
        pagination: { paginationModel: { pageSize: PAGE_SIZE_OPTIONS.TEN } },
      }}
      pageSizeOptions={pageSizeOptions}
      disableRowSelectionOnClick
      localeText={{
        MuiTablePagination: {
          labelDisplayedRows: ({ from, to, count }: LabelDisplayedRowsArgs) =>
            t(DATAGRID_KEYS.ROWS_DISPLAYED, {
              defaultValue: "{{from}}-{{to}} sur {{count}}",
              replace: {
                from,
                to,
                count:
                  count !== -1 ? count : t("common.more_than", { count: to }),
              },
            }),
          labelRowsPerPage: t(DATAGRID_KEYS.ROWS_PER_PAGE),
        },
      }}
      sx={gridStyle}
    />
  );
};

export default CSVParser;
