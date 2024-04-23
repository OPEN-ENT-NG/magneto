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

export const { useGetFoldersQuery } = foldersApi;