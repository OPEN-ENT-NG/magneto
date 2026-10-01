import { IAction } from "@edifice.io/client";
import { useQuery } from "@tanstack/react-query";

import {
  getLoolProviderContext,
  LoolProviderContext,
  sessionHasWorkflowRights,
} from "../api";
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

/**
 * useLoolOpenRight query
 * checks the lool workflow right needed to open a document in the office suite
 * @param enabled whether the query should run
 * @returns true if the user has the right
 */
export const useLoolOpenRight = (enabled: boolean) => {
  return useQuery<Record<string, boolean>, Error, boolean>({
    queryKey: ["lool", "openRight"],
    queryFn: () => sessionHasWorkflowRights([workflows.loolOpen]),
    select: (data) => !!data[workflows.loolOpen],
    staleTime: Infinity,
    enabled,
  });
};

/**
 * useLoolProviderContext query
 * fetches the office provider context once per session
 * @param enabled whether the query should run
 * @returns the lool provider context
 */
export const useLoolProviderContext = (enabled: boolean) => {
  return useQuery<LoolProviderContext | null, Error>({
    queryKey: ["lool", "providerContext"],
    queryFn: getLoolProviderContext,
    staleTime: Infinity,
    enabled,
  });
};
