import { FC } from "react";

import { useDirectory } from "@edifice.io/react";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  BorderedAvatar,
  tooltipPopperModifiers,
  userTooltipStyle,
} from "../connected-users-chip/style";
import { UserCollaboration } from "~/providers/WebsocketProvider/types";

interface UserAvatarProps {
  user: UserCollaboration;
  size: "small" | "medium";
  isCurrentUser?: boolean;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  user,
  size,
  isCurrentUser = false,
}) => {
  const { t } = useTranslation("magneto");
  const { getAvatarURL } = useDirectory();

  return (
    <Tooltip
      title={
        isCurrentUser
          ? user.username + " " + t("magneto.(you)") || t("magneto.you")
          : user.username || t("magneto.user")
      }
      placement="bottom"
      arrow
      componentsProps={{
        tooltip: {
          sx: userTooltipStyle,
        },
      }}
      slotProps={{
        popper: {
          modifiers: tooltipPopperModifiers,
        },
      }}
    >
      <BorderedAvatar
        alt={user.username}
        src={getAvatarURL(user.id, "user")}
        borderColor={user.color}
        size={size}
      />
    </Tooltip>
  );
};
