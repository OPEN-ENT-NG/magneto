import { useUser } from "@edifice-ui/react";

import { rights } from "~/config";
import { AppProps } from "~/routes/app";
import { useActions } from "~/services/queries";

export const useUserRights = ({
  data,
}: {
  data: AppProps;
}): {
  canUpdate: boolean | undefined;
  canExport: boolean | undefined;
} => {
  const { user } = useUser();
  const { data: actions } = useActions();
  const { shared } = data;

  const userId = user?.userId;
  const groupsIds = user?.groupsIds;
  const isOwner = data?.owner.userId === userId;

  let canUpdate;

  if (isOwner) {
    canUpdate = true;
  }

  if (!isOwner && rights) {
    canUpdate = shared.some((right) => {
      const groupId = right["groupId"];
      const userRight = right[rights.contrib.right];

      if (groupId !== undefined && groupsIds?.includes(groupId)) {
        return userRight;
      }

      const userRightUserId = right["userId"];
      return userRightUserId !== undefined && userId === userRightUserId
        ? userRight
        : false;
    });
  }

  const canExport = actions?.some((action) => action.available);

  return {
    canUpdate,
    canExport,
  };
};
