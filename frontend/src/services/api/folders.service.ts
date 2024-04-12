import { IHttpParams, odeServices } from "edifice-ts-client";
import { Folder, IFolderResponse } from "../../models/folder.model"

export const getFolders = async (isDeleted: boolean): Promise<void> => {
  let urlParams: IHttpParams = {queryParams: {isDeleted: isDeleted}};
  return await odeServices.http().get(`/magneto/folders`, urlParams)
    .then(res => {
      res.map((folder: IFolderResponse) => new Folder().build(folder))
    });
};
