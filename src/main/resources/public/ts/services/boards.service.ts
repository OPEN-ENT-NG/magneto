import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';


export interface IBoardsService {

}

export const boardsService: IBoardsService = {

};

export const BoardsService = ng.service('BoardsService', (): IBoardsService => boardsService);