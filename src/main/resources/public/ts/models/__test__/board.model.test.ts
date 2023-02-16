import {Board, BoardForm, Boards} from "../board.model";
import {LAYOUT_TYPE} from "../../core/enums/layout-type.enum";

describe('BoardModel', () => {
    it('test Board initialization', done => {
        const boardResponse = {
            _id: 'id',
            title: 'title',
            imageUrl: 'imageUrl',
            backgroundUrl: 'backgroundUrl',
            description: 'description',
            cardIds: ["card123"],
            sections: [],
            nbCards: 0,
            nbCardsSections: 0,
            modificationDate: 'modificationDate',
            creationDate: 'creationDate',
            folderId: 'folderId',
            shared: [],
            layoutType: LAYOUT_TYPE.FREE,
            ownerId: 'ownerId',
            ownerName: 'ownerName',
            tags: ['tag1', 'tag2'],
            public: false,
            deleted: false
        }

        const board = new Board().build(boardResponse);

        expect(board.id).toEqual(boardResponse._id);
        expect(board.title).toEqual(boardResponse.title);
        expect(board.imageUrl).toEqual(boardResponse.imageUrl);
        expect(board.backgroundUrl).toEqual(boardResponse.backgroundUrl);
        expect(board.description).toEqual(boardResponse.description);
        expect(board.cardIds).toEqual(boardResponse.cardIds);
        expect(board.nbCards).toEqual(boardResponse.nbCards);
        expect(board.modificationDate).toEqual(boardResponse.modificationDate);
        expect(board.creationDate).toEqual(boardResponse.creationDate);
        expect(board.folderId).toEqual(boardResponse.folderId);
        expect(board.tags).toEqual(boardResponse.tags);
        expect(board.public).toEqual(boardResponse.public);
        done();
    });

    it('test Boards initialization', done => {
        const boardsResponse = {
            all: [
                {
                    _id: 'id',
                    title: 'title',
                    imageUrl: 'imageUrl',
                    backgroundUrl: 'backgroundUrl',
                    description: 'description',
                    cardIds: ["card123"],
                    sections: [],
                    layoutType: LAYOUT_TYPE.FREE,
                    nbCards: 0,
                    nbCardsSections: 0,
                    modificationDate: 'modificationDate',
                    creationDate: 'creationDate',
                    folderId: 'folderId',
                    shared: [],
                    ownerId: 'ownerId',
                    ownerName: 'ownerName',
                    tags: ['tag1', 'tag2'],
                    public: false,
                    deleted: false
                }
            ],
            page: 1,
            pageCount: 1
        }

        const boards = new Boards(boardsResponse);

        expect(boards.all.length).toEqual(1);
        expect(boards.page).toEqual(1);
        expect(boards.pageCount).toEqual(1);
        done();
    });

    it('test BordForm initialization', done => {
        let form = new BoardForm();
        expect(form.id).toEqual(null);
        expect(form.title).toEqual(null);
        expect(form.description).toEqual(null);
        expect(form.imageUrl).toEqual(null);
        expect(form.backgroundUrl).toEqual(null);
        expect(form.folderId).toEqual(null);
        expect(form.cardIds).toEqual(null);
        expect(form.public).toEqual(false);
        done();
    });

    it('test boardForm isValid', done => {
        let form = new BoardForm();
        expect(form.isValid()).toEqual(false);
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';
        expect(form.isValid()).toEqual(true);
        done();
    });

    it('test boardForm toJSON', done => {
        const formJSON1 = {
            title: 'title',
            description: 'description',
            layoutType: LAYOUT_TYPE.FREE,
            imageUrl: 'imageUrl',
            backgroundUrl: 'backgroundUrl'
        }

        const formJSON2 = {
            id: 'id',
            title: 'title',
            description: 'description',
            layoutType: LAYOUT_TYPE.FREE,
            imageUrl: 'imageUrl',
            backgroundUrl: 'backgroundUrl'
        }

        let form = new BoardForm();
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';
        form.backgroundUrl = 'backgroundUrl';
        expect(form.toJSON()).toEqual(formJSON1);
        form.id = 'id';
        expect(form.toJSON()).toEqual(formJSON2);
        done();
    });
});