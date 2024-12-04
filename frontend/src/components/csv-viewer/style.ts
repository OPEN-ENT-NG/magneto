export const gridStyle = {
  fontSize: "1.4rem",
  border: "1px solid #E0E0E0",
  backgroundColor: "#FFFFFF",
  "& .MuiDataGrid-root": {
    minWidth: "100%",
  },
  "& .MuiDataGrid-main": {
    border: "none",
  },
  "& .MuiDataGrid-columnHeaders": {
    fontSize: "1.4rem",
    backgroundColor: "#F5F5F5",
    borderBottom: "2px solid #E0E0E0",
    minHeight: "40px !important",
  },
  "& .MuiDataGrid-columnHeader": {
    padding: "6px",
    minHeight: "40px !important",
    "&:not(:last-child)": {
      borderRight: "1px solid #E0E0E0",
    },
  },
  "& .MuiDataGrid-columnHeaderTitleContainerContent": {
    overflow: "hidden",
    paddingLeft: "4px",
    paddingRight: "4px",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: "700",
    color: "#1F2937",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
  },
  "& .MuiDataGrid-cell": {
    fontSize: "1.4rem",
    padding: "6px 8px",
    minHeight: "40px !important",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #E0E0E0",
    "&:not(:last-child)": {
      borderRight: "1px solid #E0E0E0",
    },
  },
  "& .MuiDataGrid-row": {
    minHeight: "40px !important",
    "&:hover": {
      backgroundColor: "#F9FAFB",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#F8FAFC",
    },
  },
  "& .MuiDataGrid-cellContent": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "100%",
    lineHeight: "1.2",
  },
  "& .MuiDataGrid-footerContainer": {
    minHeight: "40px",
    borderTop: "2px solid #E0E0E0",
    backgroundColor: "#F5F5F5",
    padding: "4px 8px",
  },
  "& .MuiTablePagination-root": {
    fontSize: "1.4rem",
  },
  "& .MuiTablePagination-selectLabel": {
    fontSize: "1.4rem",
    marginRight: "8px",
  },
  "& .MuiTablePagination-select": {
    fontSize: "1.4rem",
    padding: "4px 24px 4px 8px",
    backgroundColor: "#FFFFFF",
    borderRadius: "4px",
    border: "1px solid #E0E0E0",
  },
  "& .MuiTablePagination-displayedRows": {
    fontSize: "1.4rem",
  },
  "& .MuiDataGrid-selectedRowCount": {
    fontSize: "1.4rem",
  },
  "& .MuiDataGrid-columnSeparator": {
    visibility: "visible",
    color: "#E0E0E0",
  },
  filter: "blur(0)",
};
