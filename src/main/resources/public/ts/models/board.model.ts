import {FOLDER_TYPE} from "../core/enums/folder-type.enum";
import {_, Behaviours, model, Shareable} from "entcore";

export interface IBoardItemResponse {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    cardIds: Array<string>;
    nbCards: number;
    modificationDate: string;
    creationDate: string;
    folderId: string;
    shared: any[];
    ownerId: string;
    ownerName: string;
}

export interface IBoardsResponse {
    page: number;
    pageCount: number;
    all: Array<IBoardItemResponse>;
}

export interface IBoardsParamsRequest {
    folderId: string;
    isPublic: boolean;
    isShared: boolean;
    isDeleted: boolean;
    searchText: string;
    sortBy: string;
    page: number;
}

export interface IBoardPayload {
    id?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    folderId?: string;
    cardIds?: Array<string>;
}

export class BoardForm {
    private _id: string;
    private _title: string;
    private _description: string;
    private _imageUrl: string;
    private _folderId: string;
    private _cardIds: Array<string>;

    constructor() {
        this._id = null;
        this._title = null;
        this._description = null;
        this._imageUrl = null;
        this._folderId = null;
        this._cardIds = null;
    }

    build(board: Board): BoardForm {
        this.id = board.id;
        this.title = board.title;
        this.description = board.description;
        this.imageUrl = board.imageUrl;
        this.folderId = board.folderId;

        return this;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    set imageUrl(value: string) {
        this._imageUrl = value;
    }

    get folderId(): string {
        return this._folderId;
    }

    set folderId(value: string) {
        this._folderId = (value === FOLDER_TYPE.MY_BOARDS
            || value === FOLDER_TYPE.DELETED_BOARDS) ? null : value;
    }

    get cardIds(): Array<string> {
        return this._cardIds;
    }

    set cardIds(value: Array<string>) {
        this._cardIds = value;
    }

    isValid(): boolean {
        return this.title !== null && this.title !== '' &&
            this.imageUrl != null && this.imageUrl !== ''
    }

    toJSON(): IBoardPayload {

        let payload : IBoardPayload = {};

        if (this.title) {
            payload.title = this.title;
        }
        if (this.description) {
            payload.description = this.description;
        }
        if (this.imageUrl) {
            payload.imageUrl = this.imageUrl;
        }
        if (this.folderId) {
            payload.folderId = this.folderId;
        }

        if (this.cardIds) {
            payload.cardIds = this.cardIds;
        }

        if (this.id && this.id != '')  {
            payload.id = this.id;
        }

        return payload;
    }
}

export class Board implements Shareable {
    private _id: string;
    private _title: string;
    private _imageUrl: string;
    private _description: string;
    private _cardIds: Array<string>;
    private _nbCards: number;
    private _modificationDate: string;
    private _creationDate: string;
    private _folderId: string;

    // Share resource properties
    public shared: any[];
    public owner: {userId: string, displayName: string};
    public myRights: any;


    build(data: IBoardItemResponse): Board {
        this._id = data._id;
        this._title = data.title;
        this._imageUrl = data.imageUrl;
        this._description = data.description;
        this._cardIds = data.cardIds;
        this._nbCards = data.nbCards;
        this._modificationDate = data.modificationDate;
        this._creationDate = data.creationDate;
        this._folderId = data.folderId;
        this.owner = {userId: data.ownerId, displayName: data.ownerName};
        this.shared = data.shared;
        return this;
    }

    get id(): string {
        return this._id;
    }

    get title(): string {
        return this._title;
    }

    get description(): string {
        return this._description;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get cardIds(): Array<string> {
        return this._cardIds;
    }

    get nbCards(): number {
        return this._nbCards;
    }

    get modificationDate(): string {
        return this._modificationDate;
    }

    get creationDate(): string {
        return this._creationDate;
    }

    get folderId(): string {
        return this._folderId;
    }

    set folderId(value: string) {
        this._folderId = value;
    }

    isMyBoard() {
        return this.owner.userId === model.me.userId;
    }
}

export class Boards {
    all: Array<Board>;
    page: number;
    pageCount: number;

    constructor(data: IBoardsResponse) {
        this.all = data.all.map((board: IBoardItemResponse) =>
            Behaviours.applicationsBehaviours.magneto.resource(new Board().build(board)));
        this.page = data.page;
        this.pageCount = data.pageCount;
    }
}
