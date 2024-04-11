import { odeServices } from "edifice-ts-client";


export const getFolders = async (isDeleted: boolean): Promise<void> => {
  let urlParams: string = `?isDeleted=${isDeleted}`;
  return await odeServices.http().get(`/magneto/folders${urlParams}`);
};
