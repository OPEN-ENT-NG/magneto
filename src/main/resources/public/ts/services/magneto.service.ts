import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';


export interface IMagnetoService {
    test(): Promise<AxiosResponse>;
}

export const magnetoService: IMagnetoService = {
    // won't work since example
    test: async (): Promise<AxiosResponse> => {
        return http.get(`/magneto/test/ok`);
    }
};

export const MagnetoService = ng.service('MagnetoService', (): IMagnetoService => magnetoService);