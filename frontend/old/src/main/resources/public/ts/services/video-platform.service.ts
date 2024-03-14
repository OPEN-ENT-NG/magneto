import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {BoardForm, Boards, IBoardsParamsRequest} from "../models";

export interface IVideoPlatformService {
    getPeertubeThumbnail(domain: string, url: string): Promise<string>;

    getVimeoThumbnail(url: string): Promise<string>;

    getDailymotionThumbnail(url: string): Promise<string>;

}

export const videoPlatformService: IVideoPlatformService = {

    getPeertubeThumbnail: async (domain: string, url: string): Promise<string> => {
        return http.get(url)
            .then((res: AxiosResponse) => domain + res.data.thumbnailPath);
        },

    getVimeoThumbnail: async (url: string): Promise<string> => {
        return http.get(url)
            .then((res: AxiosResponse) => res.data.thumbnail_url);
    },

    getDailymotionThumbnail: async (url: string): Promise<string> => {
        return http.get(url)
            .then((res: AxiosResponse) => res.data.thumbnail_url);
    },

};

export const VideoPlatformService = ng.service('VideoPlatformService', (): IVideoPlatformService => videoPlatformService);