import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Folder } from "~/models/folder.model";
import { emptySplitApi } from "./empltySplitApi.service";

export const foldersApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getFolders: builder.query({
      query: (isDeleted: boolean) => `folders?isDeleted=${isDeleted}`,
    }),
    createFolder: builder.mutation({
      query: (folder: Folder) => ({
        url: "folder",
        method: "POST",
        body: { title: folder.title, parentId: folder.parentId },
      }),
    }),
  }),
});

export const { useGetFoldersQuery, useCreateFolderMutation } = foldersApi;
