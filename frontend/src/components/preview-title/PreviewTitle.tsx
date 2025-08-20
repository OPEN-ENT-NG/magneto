import { FC } from "react";

import { Edit, OpenWith } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  createdByStyle,
  EditingChip,
  iconStyle,
  secondLineWrapper,
  timeStyle,
  titleStyle,
  titleWrapper,
} from "./style";
import { PreviewTitleProps } from "./types";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";

export const PreviewTitle: FC<PreviewTitleProps> = ({
  ownerName,
  lastModifierName,
  modificationDate,
  title,
  cardId,
}) => {
  const { t } = useTranslation("magneto");

  const { connectedUsers, cardEditing } = useWebSocketMagneto();

  // Vérifier si la carte est en cours d'édition
  const cardEditingInfo = cardEditing?.find(
    (editing) => editing.cardId === cardId,
  );

  const editingUser = cardEditingInfo
    ? connectedUsers?.find((user) => user.id === cardEditingInfo.userId)
    : null;

  const editedBy = `${t("magneto.card.saved.by", {
    0: ownerName,
    1: lastModifierName,
  })}`;

  const inEditionBy = `${t("magneto.card.editing.saved.by", {
    0: ownerName,
    1: lastModifierName,
  })}`;

  const time = useElapsedTime(modificationDate as string).label;

  return (
    <Box sx={titleWrapper}>
      <Typography sx={titleStyle}>{title}</Typography>
      <Box sx={secondLineWrapper}>
        <Typography sx={createdByStyle}>
          {cardEditingInfo ? inEditionBy : editedBy}
        </Typography>
        {cardEditingInfo && editingUser && (
          <EditingChip
            label={editingUser.username}
            icon={
              cardEditingInfo.isMoving ? (
                <OpenWith sx={iconStyle} />
              ) : (
                <Edit sx={iconStyle} />
              )
            }
            size="small"
            userColor={editingUser.color}
          />
        )}
        <Typography sx={timeStyle}>{time}</Typography>
      </Box>
    </Box>
  );
};
