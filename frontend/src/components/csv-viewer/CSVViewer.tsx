import { FC, useEffect, useState } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { gridStyle } from "./style";
import { CSVParserProps } from "./types";
import { parseCSV } from "./utils";
import { useGetRessourceQuery } from "~/services/api/workspace.service";

interface GridDataType {
  rows: Array<{ id: number; [key: string]: string | number }>;
  columns: GridColDef[];
}

const CSVParser: FC<CSVParserProps> = ({ ressourceId }) => {
  const { data } = useGetRessourceQuery(
    { visibility: false, id: ressourceId },
    { skip: !ressourceId },
  );
  const [gridData, setGridData] = useState<GridDataType>({
    rows: [],
    columns: [],
  });

  useEffect(() => {
    if (data) {
      setGridData(parseCSV(data));
    }
  }, [data]);

  return (
    <DataGrid
      {...gridData}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[5, 10, 25, 50]}
      disableRowSelectionOnClick
      sx={gridStyle}
    />
  );
};

export default CSVParser;
