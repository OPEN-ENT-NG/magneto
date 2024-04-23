import { Boards, IBoardsParamsRequest } from "~/models/board.model";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const boardsApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/magneto/'}),
    tagTypes: [],
    endpoints: (builder) => ({
      getBoards: builder.query({
        query: (params: IBoardsParamsRequest) => {
            let urlParams: string = `?isPublic=${params.isPublic}&isShared=${params.isShared}` 
            + `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;
            if (params.folderId) {
                urlParams += `&folderId=${params.folderId}`;
            }
        
            if (params.page != null) {
                urlParams += `&page=${params.page}`;
            }
        
            if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
                urlParams += `&searchText=${params.searchText}`;
            }
            return `boards?isDeleted=${urlParams}`
        }
      })
      
    })
  
  })
  
  export const { useGetBoardsQuery } = boardsApi;



// export const getBoards = async (params: IBoardsParamsRequest): Promise<Boards> => {
//     let urlParams: string = `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
//     `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;

//     if (params.folderId) {
//         urlParams += `&folderId=${params.folderId}`;
//     }

//     if (params.page != null) {
//         urlParams += `&page=${params.page}`;
//     }

//     if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
//         urlParams += `&searchText=${params.searchText}`;
//     }

//     return await odeServices.http().get(`/magneto/folders${urlParams}`);
// };
