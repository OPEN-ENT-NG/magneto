import { emptySplitApi } from "./empltySplitApi.service";
import { Folder } from "~/models/folder.model";

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
    updateFolder: builder.mutation({
      query: (folder: Folder) => ({
        url: `/folder/${folder.id}`,
        method: "PUT",
        body: { title: folder.title },
      }),
    }),
    preDeleteFolders: builder.mutation({
      query: (folderIds: String[]) => ({
        url: "folders/predelete",
        method: "PUT",
        body: folderIds,
      }),
    }),
    deleteFolders: builder.mutation({
      query: (folderIds: String[]) => ({
        url: "folders",
        method: "DELETE",
        body: folderIds,
      }),
    }),
  }),
});

export const { useGetFoldersQuery, useCreateFolderMutation, useUpdateFolderMutation, usePreDeleteFoldersMutation, useDeleteFoldersMutation } = foldersApi;
