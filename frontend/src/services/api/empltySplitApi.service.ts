import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
  tagTypes: ["Folders", "Boards", "Sections"],
  endpoints: () => ({}),
});
