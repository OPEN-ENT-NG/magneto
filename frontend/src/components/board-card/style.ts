import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  styled,
  Typography,
} from "@mui/material";

import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";

export const handleCardSize = (zoomLevel: number) => {
  let cardSize = { width: "269px", height: "fit-content", minHeight: "264px" };

  switch (zoomLevel) {
    case 0:
      cardSize = { width: "132px", height: "130px", minHeight: "130px" };
      break;
    case 1:
      cardSize = { width: "183px", height: "180px", minHeight: "180px" };
      break;
    case 2:
      cardSize = { width: "228px", height: "fit-content", minHeight: "223px" };
      break;
    case 3:
      cardSize = { width: "269px", height: "fit-content", minHeight: "264px" };
      break;
    case 4:
      cardSize = { width: "330px", height: "fit-content", minHeight: "310px" };
      break;
    case 5:
      cardSize = { width: "371px", height: "fit-content", minHeight: "350px" };
      break;
  }
  return cardSize;
};

export const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number; isDragging: boolean }>(({ zoomLevel = 3, isDragging = false }) => ({
  display: "flex",
  position: "relative",
  flexDirection: "column",
  boxSizing: "border-box",
  overflow: "visible",
  borderRadius: "10px",
  boxShadow: "0 1px 3px rgba(0,0,0,.1)",
  width: handleCardSize(zoomLevel).width,
  height: handleCardSize(zoomLevel).height,

  transform: isDragging ? "scale(1.05)" : "scale(1)",
  opacity: isDragging ? "0.5" : "1",
  cursor: isDragging ? "grabbing" : "grab",
}));

export const StyledCardHeader = styled(CardHeader)({
  padding: "0.5rem",
  paddingBottom: "0.1rem",
  "& .MuiCardHeader-content": {
    overflow: "hidden",
    flex: "1 1 auto",
  },
  "& .MuiCardHeader-title": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "1.4rem",
  },
  "& .MuiCardHeader-subheader": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "1.4rem",
  },
  "& .MuiCardHeader-avatar": {
    marginRight: "0.8rem",
    marginLeft: 0,
    marginTop: "-0.5rem",
  },
  "& .MuiCardHeader-action": {
    marginLeft: 0,
    marginRight: "-0.4rem",
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});

const handleStyledCardContentHeight = (zoomLevel: number) => {
  switch (zoomLevel) {
    case 0:
      return { minHeight: "230px" };

    case 1:
      return { minHeight: "230px" };

    case 2:
      return { minHeight: "230px" };

    case 3:
      return { minHeight: "230px" };

    case 4:
      return { minHeight: "230px" };

    case 5:
      return { minHeight: "207px" };

    default:
      return { minHeight: "230px" };
  }
};

export const StyledCardContent = styled(CardContent)({
  ...handleStyledCardContentHeight,
  flex: 1,
  overflow: "hidden",
  paddingLeft: "0.6rem",
  paddingRight: "0.6rem",
  paddingTop: 0,
  paddingBottom: 0,
  display: "flex",
  flexDirection: "column",
});

export const StyledIconButton = styled(IconButton)({
  padding: 0,
  width: "3rem",
  height: "3rem",
  "& .MuiSvgIcon-root": {
    fontSize: "2.4rem",
  },
});

export const StyledTypographySubheader = styled(Typography)({
  color: "#d6d6d6",
  fontSize: "12px",
  lineHeight: "12px",
  paddingBottom: "6px",
});

export const StyledAvatar = styled(Avatar)({
  width: "3rem",
  height: "3rem",
  padding: 0,
});

export const StyledContentTitleTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  fontSize: "1.6rem",
  fontWeight: "bold",
  lineHeight: "1.8rem",
  overflowWrap: "break-word",
  color: "#4B4B4B",
  ...(zoomLevel < 2 && {
    display: "-webkit-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    WebkitLineClamp: zoomLevel === 0 ? "3" : "4",
    WebkitBoxOrient: "vertical",
    paddingBottom: 0,
  }),
  ...(zoomLevel >= 2 && {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingBottom: "1rem",
  }),
}));

export const CardContentWrapper = styled("div")<{ resourceType: string }>(({
  resourceType,
}) => {
  return {
    flex: 1,
    overflow: "hidden",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: resourceType !== RESOURCE_TYPE.TEXT ? "1rem" : "unset",
  };
});

export const StyledTypographyContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  overflow: "hidden",
});

export const StyledTypography = styled(Typography)({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#f8f9fa",
  border: "3px solid #f8f9fa",
  borderTopRightRadius: "10px",
  borderBottomLeftRadius: "10px",
  fontSize: "14px",
  flexShrink: 0,
});

export const StyledLegendTypography = styled(Typography)({
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "1.3rem",
  fontStyle: "italic",
  whiteSpace: "nowrap",
  marginLeft: "1rem",
});

export const StyledCardActions = styled(CardActions, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  justifyContent: "space-between",
  padding: "0",
  paddingRight: "0.4rem",
  paddingBottom: 0,
  paddingTop: zoomLevel < 2 ? 0 : "1rem",
  alignItems: "center",
}));

export const StyledBox = styled(Box)({
  display: "flex",
  alignItems: "center",
});

export const Simple14Typography = styled(Typography)({
  fontSize: "1.4rem",
});

export const BottomIconButton = styled(IconButton)({
  paddingLeft: "0.2rem",
});
