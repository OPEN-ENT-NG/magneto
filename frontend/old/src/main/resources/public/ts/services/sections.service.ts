import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {ISectionBoardParamsRequest, ISectionDeleteParams, SectionForm, Sections} from "../models/section.model";

export interface ISectionsService {
    getSectionsByBoard(boardId: string): Promise<Sections>;

    create(params: SectionForm): Promise<AxiosResponse>;

    update(params: SectionForm): Promise<AxiosResponse>;

    delete(params: ISectionDeleteParams): Promise<AxiosResponse>;

    duplicate(params: ISectionBoardParamsRequest): Promise<AxiosResponse>;
}

export const sectionsService: ISectionsService = {
    getSectionsByBoard: async (boardId: string): Promise<Sections> => {
        return http.get(`/magneto/sections/${boardId}`)
            .then((res: AxiosResponse) => new Sections(res.data));
    },
    create: async (params: SectionForm): Promise<AxiosResponse> => {
        return http.post(`/magneto/section`, params.toJSON());
    },
    update: async (params: SectionForm): Promise<AxiosResponse> => {
        return http.put(`/magneto/section`, params.toJSON());
    },
    delete: async (params: ISectionDeleteParams): Promise<AxiosResponse> => {
        return http.delete(`/magneto/sections`, {data: params});
    },
    duplicate: async (params: ISectionBoardParamsRequest): Promise<AxiosResponse> => {
        return http.post(`/magneto/section/duplicate`, {sectionIds: params.sectionIds, boardId: params.boardId});
    }
};

export const SectionsService = ng.service('SectionsService', (): ISectionsService => sectionsService);