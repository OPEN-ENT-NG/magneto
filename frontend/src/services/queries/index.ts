import { useQuery } from "@tanstack/react-query";
import { IAction } from "edifice-ts-client";

import { sessionHasWorkflowRights } from "../api";
import { workflows } from "~/config";

/**
 * useActions query
 * set actions correctly with workflow rights
 * @returns actions data
 */
// const { actions } = getAppParams();
export const useActions = () => {
  const { view, manage, publish, comment, favorites } = workflows;

  return useQuery<Record<string, boolean>, Error, IAction[]>({
    queryKey: ["actions"],
    queryFn: async () => {
      const availableRights = await sessionHasWorkflowRights([
        view,
        manage,
        publish,
        comment,
        favorites,
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
      ];
      return actions.map((action) => ({
        ...action,
        available: data[action.workflow],
      }));
    },
  });
};
