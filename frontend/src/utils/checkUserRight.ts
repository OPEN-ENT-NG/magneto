import { IObjectWithRights, checkHasRights } from "@edifice-ui/react";
import { RightRole } from "edifice-ts-client";

type Roles = RightRole | RightRole[];

interface UseHasRightsProps {
  roles: Roles;
  rights:
    | string
    | string[]
    | IObjectWithRights
    | IObjectWithRights[]
    | undefined;
}

export const checkUserRight = async (rights: UseHasRightsProps["rights"]) => {
  const roles: Roles = ["contrib", "creator", "manager", "read"];
  const userRights: Record<RightRole, boolean> = {
    creator: false,
    contrib: false,
    manager: false,
    read: false,
  };

  for (const role of roles) {
    const hasRight = (await checkHasRights({
      roles: role,
      rights: rights,
    })) as boolean;
    userRights[role] = hasRight;
  }

  return userRights;
};
