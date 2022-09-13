import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';


export interface IFoldersService {

}

export const foldersService: IFoldersService = {

};

export const FoldersService = ng.service('FoldersService', (): IFoldersService => foldersService);