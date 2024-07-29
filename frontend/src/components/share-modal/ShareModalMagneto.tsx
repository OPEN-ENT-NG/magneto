import { FunctionComponent } from "react";

import { OdeClientProvider, ShareModal } from "@edifice-ui/react";
import { useOdeClient } from "@edifice-ui/react";
import { RightStringified } from "edifice-ts-client";

import { RESOURCE_BIG_TYPE } from "~/core/enums/resource-big-type.enum";

type props = {
  isOpen: boolean;
  toggle: () => void;
  shareOptions: {
    resourceId: string;
    resourceRights: RightStringified[];
    resourceCreatorId: string;
  };
  resourceType: RESOURCE_BIG_TYPE;
};

export const ShareModalMagneto: FunctionComponent<props> = ({
  isOpen,
  toggle,
  shareOptions,
  resourceType,
}: props) => {
  const { appCode } = useOdeClient();
  const handleShareClose = (): void => {
    toggle();
  };

  const handleShareSuccess = (): void => {
    toggle();
  };

  const formatAppPath = `${appCode}/${resourceType}`;
  return (
    <>
      {isOpen && (
        <OdeClientProvider
          params={{
            app: formatAppPath,
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
