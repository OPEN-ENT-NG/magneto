import { memo } from "react";

import {
  CardContentWrapper,
  StyledCardContent,
  StyledContentTitleTypography,
} from "./style";
import { CardCardContentProps } from "./types";
import { CardContent } from "../card-content/CardContent";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { useTheme } from "~/hooks/useTheme";

const MemoizedCardContent = memo(CardContent);

export const CardCardContent = memo(
  ({ title, zoomLevel, resourceType, card }: CardCardContentProps) => {
    const { isTheme1D } = useTheme();

    return (
      <StyledCardContent isTheme1D={isTheme1D}>
        <StyledContentTitleTypography zoomLevel={zoomLevel}>
          {title || <span>&nbsp;</span>}
        </StyledContentTitleTypography>
        {zoomLevel > 1 && (
          <CardContentWrapper
            resourceType={resourceType}
            data-type={POINTER_TYPES.CARD_CONTENT}
          >
            <MemoizedCardContent card={card} />
          </CardContentWrapper>
        )}
      </StyledCardContent>
    );
  },
);

CardCardContent.displayName = "Content";
