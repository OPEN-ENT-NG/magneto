import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitWorkspace = createApi({
  reducerPath: "workspace",
  baseQuery: fetchBaseQuery({ baseUrl: "/workspace/" }),
  tagTypes: ["Documents"],
  endpoints: () => ({}),
});
