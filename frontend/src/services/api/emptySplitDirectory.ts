import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitDirectory = createApi({
  reducerPath: "directory",
  baseQuery: fetchBaseQuery({ baseUrl: "/directory/" }),
  tagTypes: [""],
  endpoints: () => ({}),
});
