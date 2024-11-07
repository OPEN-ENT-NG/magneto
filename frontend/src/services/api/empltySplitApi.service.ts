import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitApi = createApi({
  reducerPath: "emptySplitApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
  tagTypes: ["Folders", "Boards", "Sections", "BoardData"],
  endpoints: () => ({}),
});

export const workspaceSplitApi = createApi({
  reducerPath: "workspaceSplitApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/workspace/" }),
  tagTypes: ["Documents"],
  endpoints: () => ({}),
});
