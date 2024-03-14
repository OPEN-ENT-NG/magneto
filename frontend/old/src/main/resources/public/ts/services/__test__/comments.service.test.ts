import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {commentsService} from "../comments.service";

describe('CommentsService', () => {
    it ('returns data when getComments is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            count: 1,
            all: []
        }

        mock.onGet(`/magneto/card/cardId/comments?page=0`)
            .reply(200, data);

        commentsService.getComments('cardId', 0).then(res => {
            expect(res).toEqual(data);
            done();
        });
    });

    it ('returns data when addComment is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            "_id": "5f1f1f1f1f1f1f1f1f1f1f1f"
        }

        mock.onPost(`/magneto/card/cardId/comment`)
            .reply(200, data);

        commentsService.addComment('cardId', 'comment').then(res => {
            expect(res.id).toEqual(data._id);
            done();
        });
    });

    it ('returns data when updateComment is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            "_id": "5f1f1f1f1f1f1f1f1f1f1f1f"
        }

        mock.onPut(`/magneto/card/cardId/comment/commentId`)
            .reply(200, data);

        commentsService.updateComment('cardId', 'commentId', 'comment').then(res => {
            expect(res.id).toEqual(data._id);
            done();
        });
    });

    it ('returns data when deleteComment is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onDelete(`/magneto/card/cardId/comment/commentId`)
            .reply(200, data);

        commentsService.deleteComment('cardId', 'commentId').then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });
});