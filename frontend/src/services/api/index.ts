import { odeServices } from "edifice-ts-client";

import { AppProps } from "~/routes/app";

export type UpdateAppProps = Pick<AppProps, "name" | "map">;

export const getApp = async (url: string): Promise<void> => {
  return await odeServices.http().get(url);
};

export const updateApp = async (url: string, appBody: UpdateAppProps) => {
  console.log({ appBody });
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
