import { emptySplitApi } from "./empltySplitApi.service";
import { Folder } from "~/models/folder.model";

export const foldersApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getFolders: builder.query({
      query: (isDeleted: boolean) => `folders?isDeleted=${isDeleted}`,
      providesTags: ["Folders"],
    }),
    createFolder: builder.mutation({
      query: (folder: Folder) => ({
        url: "folder",
        method: "POST",
        body: { title: folder.title, parentId: folder.parentId },
      }),
      invalidatesTags: ["Folders"],
    }),
    updateFolder: builder.mutation({
      query: (folder: Folder) => ({
        url: `/folder/${folder.id}`,
        method: "PUT",
        body: { title: folder.title },
      }),
      invalidatesTags: ["Folders"],
    }),
    preDeleteFolders: builder.mutation({
      query: (folderIds: string[]) => ({
        url: "folders/predelete",
        method: "PUT",
        body: { folderIds: folderIds },
      }),
      invalidatesTags: ["Folders"],
    }),
    restorePreDeleteFolders: builder.mutation({
      query: (folderIds: string[]) => ({
        url: `folders/restore`,
        method: "put",
        body: { folderIds: folderIds },
      }),
      invalidatesTags: ["Folders"],
    }),
    deleteFolders: builder.mutation({
      query: (folderIds: string[]) => ({
        url: "folders",
        method: "DELETE",
        body: { folderIds: folderIds },
      }),
      invalidatesTags: ["Folders"],
    }),
  }),
});

export const {
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  usePreDeleteFoldersMutation,
  useRestorePreDeleteFoldersMutation,
  useDeleteFoldersMutation,
} = foldersApi;
