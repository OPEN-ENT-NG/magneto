import { memo } from "react";

import Icon from "@mdi/react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

import {
  bottomIconButton,
  simple14Typography,
  styledBox,
  StyledCardActions,
  styledLegendTypography,
  styledTypography,
  styledTypographyContainer,
} from "./style";
import { CardActionsProps } from "./types";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { useTheme } from "~/hooks/useTheme";

export const CardActions = memo(
  ({
    cardIsLiked,
    zoomLevel,
    icon,
    type,
    caption,
    nbOfFavorites,
    displayNbFavorites,
    handleFavoriteClick,
    isExternalView,
  }: CardActionsProps) => {
    const { isTheme1D } = useTheme();

    return (
      <StyledCardActions
        zoomLevel={zoomLevel}
        isTheme1D={isTheme1D}
        disableSpacing
      >
        <Box sx={styledTypographyContainer}>
          <Typography sx={styledTypography}>
            <Icon path={icon} size={1} />
            {type}
          </Typography>
          {zoomLevel > 1 && (
            <Tooltip title={caption}>
              <Box sx={styledLegendTypography}>{caption}</Box>
            </Tooltip>
          )}
        </Box>
        {!(isExternalView && !displayNbFavorites) && (
          <Box sx={styledBox}>
            {displayNbFavorites && (
              <Typography sx={simple14Typography}>{nbOfFavorites}</Typography>
            )}
            <IconButton
              sx={bottomIconButton}
              aria-label="add to favorites"
              size="small"
              onClick={handleFavoriteClick}
              data-type={POINTER_TYPES.NON_SELECTABLE}
              disabled={isExternalView}
            >
              {cardIsLiked ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Box>
        )}
      </StyledCardActions>
    );
  },
);

CardActions.displayName = "CardActions";
