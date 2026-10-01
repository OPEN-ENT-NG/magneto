import { odeServices } from "@edifice.io/client";

import { AppProps } from "~/routes/app";

export type UpdateAppProps = Pick<AppProps, "name" | "map">;

export const getApp = async (url: string): Promise<void> => {
  return await odeServices.http().get(url);
};

export const updateApp = async (url: string, appBody: UpdateAppProps) => {
  return await odeServices.http().putJson(url, appBody);
};

/**
 * sessionHasWorkflowRights API
 * @param actionRights
 * @returns check if user has rights
 */
export const sessionHasWorkflowRights = async (actionRights: string[]) => {
  return await odeServices.rights().sessionHasWorkflowRights(actionRights);
};

export interface LoolCapability {
  "content-type": string;
  extension: string;
}

export interface LoolProviderContext {
  provider: string;
  capabilities: LoolCapability[];
}

/**
 * getLoolProviderContext API
 * @returns the office provider (OnlyOffice, LibreOfficeOnline) and the file types it can open,
 * or null when lool is unavailable (e.g. not installed)
 */
export const getLoolProviderContext =
  async (): Promise<LoolProviderContext | null> => {
    // fetch rather than odeServices.http(): the legacy ng-app.js loaded for lool patches
    // XMLHttpRequest and rejects every XHR when the "authenticated" cookie is missing.
    // null (not an error) is returned so the result stays cached and is not refetched.
    const response = await fetch("/lool/providers/context").catch(() => null);
    if (!response?.ok) return null;
    const context: LoolProviderContext | null = await response
      .json()
      .catch(() => null);
    if (
      typeof context?.provider !== "string" ||
      !Array.isArray(context?.capabilities)
    ) {
      return null;
    }
    return context;
  };
