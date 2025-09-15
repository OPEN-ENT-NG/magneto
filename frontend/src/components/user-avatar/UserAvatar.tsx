import { FC, useEffect } from "react";

import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  BorderedAvatar,
  tooltipPopperModifiers,
  userTooltipStyle,
} from "../connected-users-chip/style";
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

  useEffect(() => {
    console.log(userbookData);
  }, [userbookData]);

  const getInitials = (username?: string): string => {
    if (!username) return "??";

    const words = username.trim().split(/\s+/);

    if (words.length === 1) {
      // 1 mot : prendre les 2 premières lettres
      return words[0].slice(0, 2).toUpperCase();
    } else {
      // 2+ mots : première lettre du premier mot + première lettre du dernier mot
      const firstLetter = words[0].charAt(0);
      const lastLetter = words[words.length - 1].charAt(0);
      return (firstLetter + lastLetter).toUpperCase();
    }
  };

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
          userbookData?.picture !== "no-avatar.svg" ? userbookData?.picture : ""
        }
        borderColor={user.color}
        size={size}
      >
        {getInitials(user.username)}
      </BorderedAvatar>
    </Tooltip>
  );
};
