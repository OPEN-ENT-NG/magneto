import { FC } from "react";

import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  BorderedAvatar,
  tooltipPopperModifiers,
  userTooltipStyle,
} from "../connected-users-chip/style";
import { useInitials } from "~/hooks/useInitials";
import { UserCollaboration } from "~/providers/WebsocketProvider/types";
import { useGetUserbookInfosQuery } from "~/services/api/directory.service";

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
  const { data: userbookData } = useGetUserbookInfosQuery({ id: user.id });

  const initials = useInitials(user.username);

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
        src={
          userbookData?.picture?.startsWith("/userbook/")
            ? userbookData?.picture
            : ""
        }
        borderColor={user.color}
        size={size}
      >
        {initials}
      </BorderedAvatar>
    </Tooltip>
  );
};
