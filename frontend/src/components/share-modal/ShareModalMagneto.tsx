import React, { FunctionComponent, useEffect } from "react";

import { OdeClientProvider, ShareModal } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { RESOURCE_BIG_TYPE } from "~/core/enums/resource-big-type.enum";

type props = {
  isOpen: boolean;
  toggle: () => void;
  shareOptions: any;
  resourceType: RESOURCE_BIG_TYPE;
};

export const ShareModalMagneto: FunctionComponent<props> = ({
  isOpen,
  toggle,
  shareOptions,
  resourceType,
}: props) => {
  const { t } = useTranslation("magneto");

  const handleShareClose = (): void => {
    toggle();
  };

  const handleShareSuccess = (): void => {
    toggle();
  };

  useEffect(() => {
    const checkTitle = () => {
      if (document.title !== t("magneto.title")) {
        document.title = t("magneto.title");
      }
    };
    const intervalId = setInterval(checkTitle, 250);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {isOpen && (
        <OdeClientProvider
          params={{
            app: `magneto/${resourceType}`,
          }}
        >
          <ShareModal
            isOpen={isOpen}
            shareOptions={shareOptions}
            onCancel={handleShareClose}
            onSuccess={handleShareSuccess}
          />
        </OdeClientProvider>
      )}
    </>
  );
};
