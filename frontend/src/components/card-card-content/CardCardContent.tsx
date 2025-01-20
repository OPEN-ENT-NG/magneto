import { memo } from "react";

import {
  CardContentWrapper,
  StyledCardContent,
  StyledContentTitleTypography,
} from "./style";
import { CardCardContentProps } from "./types";
import { CardContent } from "../card-content/CardContent";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";

const MemoizedCardContent = memo(CardContent);

export const CardCardContent = memo(
  ({ title, zoomLevel, resourceType, card }: CardCardContentProps) => (
    <StyledCardContent data-type={POINTER_TYPES.CARD_CONTENT}>
      <StyledContentTitleTypography zoomLevel={zoomLevel}>
        {title || <span>&nbsp;</span>}
      </StyledContentTitleTypography>
      {zoomLevel > 1 && (
        <CardContentWrapper resourceType={resourceType}>
          <MemoizedCardContent card={card} />
        </CardContentWrapper>
      )}
    </StyledCardContent>
  ),
);

CardCardContent.displayName = "Content";
