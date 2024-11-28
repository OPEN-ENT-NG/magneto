import { memo } from "react";

import LockIcon from "@mui/icons-material/Lock";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Tooltip,
  Typography,
  CardHeader as MuiCardHeader,
  Avatar,
  IconButton,
} from "@mui/material";

import {
  styledAvatar,
  styledCardHeader,
  styledIconButton,
  styledTypographySubheader,
} from "./style";
import { CardHeaderProps } from "./types";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { useElapsedTime } from "~/hooks/useElapsedTime";

const TimestampDisplay = memo(
  ({ modificationDate }: { modificationDate: string }) => {
    const { label, tooltip } = useElapsedTime(modificationDate);

    return (
      <Tooltip title={tooltip} placement="bottom-start">
        <Typography sx={styledTypographySubheader}>{label}</Typography>
      </Tooltip>
    );
  },
  (prevProps, nextProps) =>
    prevProps.modificationDate === nextProps.modificationDate,
);

export const CardHeader = memo(
  ({
    avatarUrl,
    ownerName,
    modificationDate,
    onToggleDropdown,
    isLocked,
  }: CardHeaderProps) => (
    <MuiCardHeader
      sx={styledCardHeader}
      avatar={<Avatar sx={styledAvatar} aria-label="recipe" src={avatarUrl} />}
      action={
        <div>
          {isLocked && <LockIcon />}
          <IconButton
            sx={styledIconButton}
            aria-label="settings"
            onClick={onToggleDropdown}
            data-type={POINTER_TYPES.NON_SELECTABLE}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
      }
      title={ownerName}
      subheader={<TimestampDisplay modificationDate={modificationDate} />}
    />
  ),
);

CardHeader.displayName = "CardHeader";
