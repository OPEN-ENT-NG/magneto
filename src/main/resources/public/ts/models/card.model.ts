import {RESOURCE_TYPE} from "../core/enums/resource-type.enum";
import {CardComment, ICardItemCommentResponse} from "./card-comment.model";

export interface ICardItemResponse {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    caption: string;
    locked: boolean;
    resourceId: string;
    resourceType: string;
    resourceUrl: string;
    ownerId: string;
    ownerName: string;
    modificationDate: string;
    creationDate: string;
    lastModifierId: string;
    lastModifierName: string;
    boardId: string;
    boardTitle?: string;
    parentId: string;
    metadata: IMetadata;
    lastComment?: ICardItemCommentResponse;
    nbOfComments?: number;
}

export interface ICardsResponse {
    page: number;
    pageCount: number;
    all: Array<ICardItemResponse>;
}

export interface ICardsParamsRequest {
    page?: number,
    boardId?: string;
    searchText?: string;
    sortBy?: string;
    isPublic?: boolean;
    isShared?: boolean;
    isFavorite?: boolean;
}

export interface ICardsSectionParamsRequest {
    page?: number,
    sectionId?: string;
}

export interface ICardsBoardParamsRequest {
    cardIds: Array<string>,
    sectionId?: string;
    boardId: string;
}

export interface ICardPayload {
    id?: string;
    title: string;
    description: string;
    caption: string;
    resourceId: string;
    resourceType: string;
    locked?: boolean;
    resourceUrl?: string;
    boardId: string;
    sectionId?: string;
}

export interface IMetadata {
    name: string;
    filename: string;
    contentType: string;
    contentTransferEncoding: string;
    charset: string;
    size: number;
}

export class CardForm {

    private _id: string;
    private _title: string;
    private _description: string;
    private _caption: string;
    private _locked: boolean;
    private _resourceId: string;
    private _resourceType: string;
    private _resourceUrl: string;
    private _resourceFileName: string;
    private _boardId: string;
    private _sectionId: string;


    constructor() {
        this._id = '';
        this._title = '';
        this._description = '';
        this._caption = '';
        this._resourceId = '';
        this._resourceUrl = '';
        this._resourceFileName = '';
        this._resourceType = '';
        this._boardId = '';
        this._locked = false;
        this._sectionId = null;
    }

    build(card: Card): CardForm {
        this._id = card.id;
        this._title = card.title;
        this._description = card.description;
        this._caption = card.caption;
        this._resourceId = card.resourceId;
        this._resourceUrl = card.resourceUrl;
        this._resourceType = card.resourceType;
        this._boardId = card.boardId;
        this._locked = card.locked;
        this._sectionId = null;
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

    get resourceId(): string {
        return this._resourceId;
    }

    set resourceId(value: string) {
        if (this.resourceType === RESOURCE_TYPE.IMAGE) {
            this._resourceUrl = '/workspace/document/' + value;
        }

        this._resourceId = value;
    }

    get resourceUrl(): string {
        return this._resourceUrl;
    }

    set resourceUrl(value: string) {
        this._resourceUrl = value;
    }

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
    }

    get resourceType(): string {
        return this._resourceType;
    }

    set resourceType(value: string) {
        this._resourceType = value;
    }

    get boardId(): string {
        return this._boardId;
    }

    get locked(): boolean {
        return this._locked;
    }

    set locked(value: boolean) {
        this._locked = value;
    }

    set boardId(value: string) {
        this._boardId = value;
    }

    get sectionId(): string {
        return this._sectionId;
    }

    set sectionId(value: string) {
        this._sectionId = value;
    }

    get resourceFileName(): string {
        return this._resourceFileName;
    }

    set resourceFileName(value: string) {
        this._resourceFileName = value;
    }

    isValid(): boolean {
        return this.resourceType != null && this.resourceType !== '';
    }

    toJSON(): ICardPayload {

        let payload: ICardPayload = {
            title: this.title,
            description: this.description,
            caption: this.caption,
            locked: this.locked,
            resourceId: this.resourceId,
            resourceType: this.resourceType,
            resourceUrl: this.resourceUrl,
            boardId: this.boardId
        };

        if (this.sectionId && this.sectionId != '') payload.sectionId = this.sectionId;
        if (this.id && this.id != '') payload.id = this.id;

        return payload;
    }
}

export class Card {

    private _id: string;
    private _title: string;
    private _resourceId: string;
    private _resourceType: string;
    private _resourceUrl: string;
    private _description: string;
    private _caption: string;
    private _locked: boolean;
    private _ownerId: string;
    private _ownerName: string
    private _modificationDate: string;
    private _creationDate: string;
    private _lastModifierId: string;
    private _lastModifierName: string;
    private _boardId: string;
    private _boardTitle: string;
    private _parentId: string;
    private _metadata: IMetadata;
    private _nbOfComments: number;
    private _lastComment: CardComment;

    build(data: ICardItemResponse): Card {
        this._id = data._id ? data._id : data.id;
        this._title = data.title;
        this._resourceId = data.resourceId;
        this._resourceType = data.resourceType;
        this._resourceUrl = data.resourceUrl;
        this._description = data.description;
        this._caption = data.caption;
        this._locked = data.locked;
        this._modificationDate = data.modificationDate;
        this._creationDate = data.creationDate;
        this._ownerId = data.ownerId;
        this._ownerName = data.ownerName;
        this._lastModifierId = data.lastModifierId;
        this._lastModifierName = data.lastModifierName;
        this._boardId = data.boardId;
        this._boardTitle = data.boardTitle;
        this._parentId = data.parentId;
        this._metadata = data.metadata;
        this._nbOfComments = data.nbOfComments;
        this._lastComment = (data.nbOfComments != null && data.nbOfComments > 0) ?
                            new CardComment().build(data.lastComment) : null;
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

    get caption(): string {
        return this._caption;
    }

    get locked(): boolean {
        return this._locked;
    }

    get resourceId(): string {
        return this._resourceId;
    }

    get resourceType(): string {
        return this._resourceType;
    }

    get creationDate(): string {
        return this._creationDate;
    }

    get modificationDate(): string {
        return this._modificationDate;
    }

    get ownerName(): string {
        return this._ownerName;
    }

    set ownerName(value: string) {
        this._ownerName = value;
    }

    get ownerId(): string {
        return this._ownerId;
    }

    set ownerId(value: string) {
        this._ownerId = value;
    }

    get parentId(): string {
        return this._parentId;
    }

    set parentId(value: string) {
        this._parentId = value;
    }

    get boardId(): string {
        return this._boardId;
    }

    set boardId(value: string) {
        this._boardId = value;
    }

    get boardTitle(): string {
        return this._boardTitle;
    }

    set boardTitle(value: string) {
        this._boardTitle = value;
    }

    get lastModifierName(): string {
        return this._lastModifierName;
    }

    set lastModifierName(value: string) {
        this._lastModifierName = value;
    }

    get lastModifierId(): string {
        return this._lastModifierId;
    }

    set lastModifierId(value: string) {
        this._lastModifierId = value;
    }

    get metadata(): IMetadata {
        return this._metadata;
    }

    set metadata(value: IMetadata) {
        this._metadata = value;
    }

    get resourceUrl(): string {
        return this._resourceUrl;
    }

    set resourceUrl(value: string) {
        this._resourceUrl = value;
    }

    get nbOfComments(): number {
        return this._nbOfComments;
    }

    set nbOfComments(value: number) {
        this._nbOfComments = value;
    }

    get lastComment(): CardComment {
        return this._lastComment;
    }

    set lastComment(value: CardComment) {
        this._lastComment = value;
    }

    isType = (resourceType: string): boolean => {
        return this.resourceType == resourceType;
    }

}

export class Cards {
    all: Array<Card>;
    page: number;
    pageCount: number;

    constructor(data: ICardsResponse) {
        this.all = data.all.map((card: ICardItemResponse) => new Card().build(card));
        this.page = data.page;
        this.pageCount = data.pageCount;
    }
}

export class CardCollection {
    cards: Array<Card>;
    boardId: string;
    boardTitle?: string;
    isLinkedCardsDisplay: boolean

    constructor(boardId: string, cards: Array<Card>) {
        this.cards = cards;
        this.boardId = boardId;
        this.isLinkedCardsDisplay = false;
    }
}
