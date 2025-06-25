import { IAction } from "@edifice.io/client";
import { useQuery } from "@tanstack/react-query";

import { sessionHasWorkflowRights } from "../api";
import { workflows } from "~/config";

/**
 * useActions query
 * set actions correctly with workflow rights
 * @returns actions data
 */
// const { actions } = getAppParams();
export const useActions = () => {
  const {
    view,
    manage,
    publish,
    comment,
    favorites,
    publicBoard,
    synchronous,
  } = workflows;

  return useQuery<Record<string, boolean>, Error, IAction[]>({
    queryKey: ["actions"],
    queryFn: async () => {
      const availableRights = await sessionHasWorkflowRights([
        view,
        manage,
        publish,
        comment,
        favorites,
        publicBoard,
        synchronous,
      ]);
      return availableRights;
    },
    select: (data) => {
      const actions: any[] = [
        {
          id: "view",
          workflow: view,
        },
        {
          id: "manage",
          workflow: manage,
        },
        {
          id: "publish",
          workflow: publish,
        },
        {
          id: "comment",
          workflow: comment,
        },
        {
          id: "favorites",
          workflow: favorites,
        },
        {
          id: "public",
          workflow: publicBoard,
        },
        {
          id: "synchronous",
          workflow: synchronous,
        },
      ];
      return actions.map((action) => ({
        ...action,
        available: data[action.workflow],
      }));
    },
  });
};
