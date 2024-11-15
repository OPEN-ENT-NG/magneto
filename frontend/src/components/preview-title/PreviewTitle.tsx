import { FC } from "react";

import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  createdByStyle,
  secondLineWrapper,
  timeStyle,
  titleStyle,
  titleWrapper,
} from "./style";
import { PreviewTitleProps } from "./types";
import { useElapsedTime } from "~/hooks/useElapsedTime";

export const PreviewTitle: FC<PreviewTitleProps> = ({
  ownerName,
  lastModifierName,
  modificationDate,
  title,
}) => {
  const { t } = useTranslation("magneto");

  const createdBy = `${t("magneto.card.saved.by", {
    0: ownerName,
    1: lastModifierName,
  })}`;

  const time = useElapsedTime(modificationDate as string).label;

  return (
    <Box sx={titleWrapper}>
      <Typography sx={titleStyle}>{title}</Typography>
      <Box sx={secondLineWrapper}>
        <Typography sx={createdByStyle}>{createdBy}</Typography>
        <Typography sx={timeStyle}>{time}</Typography>
      </Box>
    </Box>
  );
};
