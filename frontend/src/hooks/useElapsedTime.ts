import { useMemo } from "react";

import { useTranslation } from "react-i18next";

export const useElapsedTime = (dateString: string) => {
  const { t } = useTranslation("magneto");

  return useMemo(() => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const tooltip = date
      .toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");

    if (diffInSeconds < 60) {
      return {
        label:
          diffInSeconds === 1
            ? t("magneto.card.time.one.seconds")
            : t("magneto.card.time.seconds", { 0: diffInSeconds }),
        tooltip,
      };
    }

    if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return {
        label:
          diffInMinutes === 1
            ? t("magneto.card.time.one.minutes")
            : t("magneto.card.time.minutes", { 0: diffInMinutes }),
        tooltip,
      };
    }

    if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      return {
        label:
          diffInHours === 1
            ? t("magneto.card.time.one.hours")
            : t("magneto.card.time.hours", { 0: diffInHours }),
        tooltip,
      };
    }

    if (diffInSeconds < 172800) {
      return {
        label: t("magneto.card.time.yesterday"),
        tooltip,
      };
    }

    return {
      label: date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      tooltip,
    };
  }, [dateString]);
};
