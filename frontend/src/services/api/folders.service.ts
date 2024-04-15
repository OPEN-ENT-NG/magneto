import { IHttpParams, odeServices } from "edifice-ts-client";
import { Folder, IFolderResponse } from "../../models/folder.model"
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const foldersApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/magneto/'}),
  tagTypes: [],
  endpoints: (builder) => ({
    getFolders: builder.query({
      query: (isDeleted: boolean) => `folders?isDeleted=${isDeleted}`
    })
    
  })

})

// export const getFolders = async (isDeleted: boolean): Promise<void> => {
//   let urlParams: IHttpParams = {queryParams: {isDeleted: isDeleted}};
//   return await odeServices.http().get(`/magneto/folders`, urlParams)
//     .then(res => {
//       res.map((folder: IFolderResponse) => new Folder().build(folder))
//     });
// };


export const { useGetFoldersQuery } = foldersApi;