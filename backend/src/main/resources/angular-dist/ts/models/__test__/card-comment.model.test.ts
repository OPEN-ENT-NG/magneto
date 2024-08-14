import {CardComment} from "../card-comment.model";

describe('CardCommentModel', () => {
    it ('test CardComment initialization', done => {
        const commentResponse = {
            _id: 'id',
            ownerId: 'ownerId',
            ownerName: 'ownerName',
            creationDate: '2023-01-01T00:00:00.000Z',
            modificationDate: '2023-01-01T00:00:00.000Z',
            content: 'content'
        }


        let comment = new CardComment().build(commentResponse);
        expect(comment.id).toEqual(commentResponse._id);
        expect(comment.ownerId).toEqual(commentResponse.ownerId);
        expect(comment.ownerName).toEqual(commentResponse.ownerName);
        expect(comment.creationDate).toEqual(commentResponse.creationDate);
        expect(comment.modificationDate).toEqual(commentResponse.modificationDate);
        expect(comment.content).toEqual(commentResponse.content);
        done();
    });
});