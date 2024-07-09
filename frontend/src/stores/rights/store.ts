import { RightRole } from "edifice-ts-client";
import { create } from "zustand";

type UserRights = Record<RightRole, boolean>;

interface UserRightsState {
  userRights: UserRights;
  setUserRights: (rights: UserRights) => void;
}

/**
 * Basic store for managing "rights"
 * Use this store with `checkUserRight` utils from @edifice-ui/react
 * You can check rights in a react-router loader
 * And set userRights within the store to get a stable global state
 */
export const useUserRightsStore = create<UserRightsState>((set) => ({
  userRights: {
    creator: false,
    contrib: false,
    manager: false,
    read: false,
  },
  setUserRights: (rights: UserRights) => set({ userRights: rights }),
}));
