import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
//import { IHttpParams, odeServices } from "edifice-ts-client";

//import { Folder, IFolderResponse } from "../../models/folder.model"

export const foldersApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
  tagTypes: [],
  endpoints: (builder) => ({
    getFolders: builder.query({
      query: (isDeleted: boolean) => `folders?isDeleted=${isDeleted}`,
    }),
  }),
});

export const { useGetFoldersQuery } = foldersApi;
