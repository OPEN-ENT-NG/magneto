import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
  tagTypes: [
    "Folders",
    "Boards",
    "Sections",
    "BoardData",
    "CardComments",
    "AllCards",
  ],
  endpoints: () => ({}),
});
