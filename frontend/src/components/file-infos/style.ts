import { Card, styled } from "@mui/material";

export const FileInfosStyled = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isHorizontal",
})<{ isHorizontal: boolean }>(({ theme, isHorizontal }) => ({
  width: "100%",
  "& .MuiCardContent-root": {
    padding: theme.spacing(3, 4),
    display: "flex",
    flexDirection: isHorizontal ? "column" : "row",
    justifyContent: isHorizontal ? "initial" : "space-between",
    alignItems: isHorizontal ? "initial" : "center",

    "& .text-content": {
      display: "flex",
      flexDirection: "column",
      marginBottom: isHorizontal ? theme.spacing(2) : 0,
      marginRight: isHorizontal ? 0 : theme.spacing(2),
      "& .MuiTypography-root": {
        fontSize: "1.5rem",
        marginBottom: theme.spacing(1),
        wordBreak: "break-word",
        "& span": {
          fontWeight: "bold",
        },
      },
    },
    "& .button-group": {
      display: "flex",
      flexDirection: isHorizontal ? "column" : "row",
      gap: theme.spacing(2),
      alignItems: isHorizontal ? "initial" : "center",
      "& .download-btn": {
        color: "#FF6600",
        border: "1px solid #FF6600",
        backgroundColor: "white",
        textTransform: "none",
        fontSize: "1.5rem",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flexShrink: isHorizontal ? 0 : 1,
      },
    },
  },
}));
