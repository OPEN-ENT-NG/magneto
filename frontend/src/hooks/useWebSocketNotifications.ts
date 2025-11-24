import { useCallback } from "react";

import { useEdificeClient } from "@edifice.io/react";
import { useToast } from "@edifice.io/react";
import { useTranslation } from "react-i18next";

import { MESSAGE_TYPE_TO_I18N_KEY } from "~/core/enums/websocket-message-type";
import { WebSocketUpdate } from "~/providers/WebsocketProvider/types";

export const useWebSocketNotifications = () => {
  const { t } = useTranslation("magneto");
  const toast = useToast();
  const { user } = useEdificeClient();

  const handleWebSocketUpdate = useCallback(
    (update: WebSocketUpdate) => {
      // Notifier seulement l'utilisateur ayant effectué l'action
      if (update.userId !== user?.userId) {
        return;
      }

      const i18nKey = MESSAGE_TYPE_TO_I18N_KEY[update.type];

      if (i18nKey) {
        toast.success(t(i18nKey));
      }
    },
    [user?.userId, t],
  );

  return { handleWebSocketUpdate };
};
