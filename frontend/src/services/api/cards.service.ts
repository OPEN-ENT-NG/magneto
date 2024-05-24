import { odeServices } from "edifice-ts-client";

import { ICardsParamsRequest } from "../../models/card.model";

/*export const cardsApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "/magneto/" }),
    tagTypes: [],
    endpoints: (builder) => ({
        getAllCardsCollection: builder.query({
            query: (params: ICardsParamsRequest) => `cards/collection?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`,
        }),
    }),
});

export const { useGetAllCardsCollectionQuery } = cardsApi;*/

export const getAllCardsCollection = async (
  params: ICardsParamsRequest,
): Promise<any> => {
  const urlParams: string = `?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isFavorite=${params.isFavorite}&isShared=${params.isShared}&page=${params.page}`;

  return await odeServices.http().get(`/magneto/cards/collection${urlParams}`);
};
