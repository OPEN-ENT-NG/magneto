import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';


export interface ICardsService {

}

export const cardsService: ICardsService = {

};

export const CardsService = ng.service('CardsService', (): ICardsService => cardsService);