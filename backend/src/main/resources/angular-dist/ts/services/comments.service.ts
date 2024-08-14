import {ng} from "entcore";
import http, {AxiosResponse} from "axios";
import {CardComment, CardComments} from "../models/card-comment.model";

export interface ICommentsService {
    addComment(cardId: string, comment: string): Promise<CardComment>;

    getComments(cardId: string, page?: number): Promise<CardComments>;

    updateComment(cardId: string, commentId: string, content: string): Promise<CardComment>;

    deleteComment(cardId: string, commentId: string): Promise<AxiosResponse>;
}


export const commentsService: ICommentsService = {
    addComment: async (cardId: string, comment: string): Promise<CardComment> => {
        return http.post(`/magneto/card/${cardId}/comment`, {content: comment})
            .then((res: AxiosResponse) => new CardComment().build(res.data))
    },
    getComments(cardId: string, page?: number): Promise<CardComments> {
        return http.get(`/magneto/card/${cardId}/comments?page=${page}`)
            .then((res: AxiosResponse) => new CardComments(res.data));
    },

    updateComment: async (cardId: string, commentId: string, content: string): Promise<CardComment> => {
        return http.put(`/magneto/card/${cardId}/comment/${commentId}`, {content})
            .then((res: AxiosResponse) => new CardComment().build(res.data))
    },

    deleteComment: async (cardId: string, commentId: string): Promise<AxiosResponse> => {
        return http.delete(`/magneto/card/${cardId}/comment/${commentId}`);
    }
};

export const CommentsService = ng.service('CommentsService', (): ICommentsService => commentsService);
