import {FOLDER_TYPE} from "../core/enums/folder-type.enum";
import {Behaviours, model, Shareable} from "entcore";
import {LAYOUT_TYPE} from "../core/enums/layout-type.enum";
import {Section} from "./section.model";

export interface IBoardItemResponse {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    cardIds: Array<string>;
    sections: Array<Section>;
    tags: Array<string>;
    nbCards: number;
    nbCardsSections: number;
    modificationDate: string;
    creationDate: string;
    folderId: string;
    shared: any[];
    layoutType: LAYOUT_TYPE;
    deleted: boolean;
    public: boolean;
    ownerId: string;
    ownerName: string;
}

export interface IBoardsResponse {
    page: number;
    pageCount: number;
    all: Array<IBoardItemResponse>;
}

export interface IBoardsParamsRequest {
    folderId?: string;
    isPublic: boolean;
    isShared: boolean;
    isDeleted: boolean;
    searchText?: string;
    sortBy: string;
    page?: number;
}

export interface IBoardPayload {
    id?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    folderId?: string;
    cardIds?: Array<string>;
    sectionIds?: Array<string>;
    tags?: Array<string>;
    public?: boolean;
    layoutType?: LAYOUT_TYPE;
}

export interface ISection {
    title: string;
    cardIds?: Array<string>;
}


export class BoardForm {
    private _id: string;
    private _title: string;
    private _description: string;
    private _imageUrl: string;
    private _folderId: string;
    private _cardIds: Array<string>;
    private _sectionIds: Array<string>;
    private _public: boolean;
    private _tags: Array<string>;
    private _tagsTextInput: string;
    private _layoutType: LAYOUT_TYPE;

    constructor() {
        this._id = null;
        this._title = null;
        this._description = null;
        this._imageUrl = null;
        this._folderId = null;
        this._cardIds = null;
        this._sectionIds = null;
        this._public = false;
        this._tags = null;
        this._layoutType = LAYOUT_TYPE.FREE;
        this._tagsTextInput = null;
    }

    build(board: Board): BoardForm {
        this.id = board.id;
        this.title = board.title;
        this.description = board.description;
        this.imageUrl = board.imageUrl;
        this.folderId = board.folderId;
        this.tags = board.tags;
        this.tagsTextInput = board.tagsTextInput;
        this.public = board.public;
        this.layoutType = board.layoutType;
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

    get sectionsIds(): Array<string> {
        return this._sectionIds;
    }

    set sectionsIds(value: Array<string>) {
        this._sectionIds = value;
    }

    get tags(): Array<string> {
        return this._tags;
    }

    set tags(value: Array<string>) {
        this._tags = value;
    }

    get layoutType(): LAYOUT_TYPE {
        return this._layoutType;
    }

    set layoutType(value: LAYOUT_TYPE) {
        this._layoutType = value;
    }

    get tagsTextInput(): string {
        return this._tagsTextInput;
    }

    set tagsTextInput(value: string) {
        this._tagsTextInput = value;
    }

    get public(): boolean {
        return this._public;
    }

    set public(value: boolean) {
        this._public = value;
    }

    isLayoutFree(): boolean {
        return this.layoutType == LAYOUT_TYPE.FREE;
    }

    isValid(): boolean {
        return this.title !== null && this.title !== '' &&
            this.imageUrl != null && this.imageUrl !== '' && this.layoutType !== null;
    }


    toJSON(): IBoardPayload {

        let payload: IBoardPayload = {};

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

        if (this.sectionsIds) {
            payload.sectionIds = this.sectionsIds;
        }

        if (this.tags) {
            payload.tags = this.tags;
        }

        if (this.layoutType) {
            payload.layoutType = this.layoutType;
        }

        if (this.public) {
            payload.public = this.public;
        }

        if (this.id && this.id != '') {
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
    private _sections: Array<Section>;
    private _tags: Array<string>;
    private _layoutType: LAYOUT_TYPE;
    private _tagsTextInput: string;
    private _nbCards: number;
    private _nbCardsSections: number;
    private _modificationDate: string;
    private _creationDate: string;
    private _folderId: string;
    private _public: boolean;
    private _deleted: boolean;


    // Share resource properties
    public shared: any[];
    public owner: { userId: string, displayName: string };
    public myRights: any;


    build(data: IBoardItemResponse): Board {
        this._id = data._id;
        this._title = data.title;
        this._imageUrl = data.imageUrl;
        this._description = data.description;
        this._cardIds = data.cardIds;
        this._sections = data.sections;
        this._layoutType = data.layoutType;
        this._tags = data.tags;
        this._tagsTextInput = data.tags ? data.tags
            .map((tag: string) => '#' + tag)
            .toString()
            .replace(/,/g, ' ') : '';

        this._nbCards = data.nbCards;
        this._nbCardsSections = data.nbCardsSections;
        this._modificationDate = data.modificationDate;
        this._creationDate = data.creationDate;
        this._folderId = data.folderId;
        this._public = data.public;
        this.owner = {userId: data.ownerId, displayName: data.ownerName};
        this.shared = data.shared;
        this._deleted = data.deleted;
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

    get sections(): Array<Section> {
        return this._sections;
    }

    get sectionsIds(): Array<String> {
        return this._sections.map(section => section.id);
    }

    set sections(value: Array<Section>) {
        this._sections = value;
    }

    get nbCards(): number {
        return this._nbCards;
    }

    get nbCardsSections(): number {
        return this._nbCardsSections;
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

    get public(): boolean {
        return this._public;
    }

    get deleted(): boolean {
        return this._deleted;
    }

    set folderId(value: string) {
        this._folderId = value;
    }

    get layoutType(): LAYOUT_TYPE {
        return this._layoutType;
    }

    set layoutType(value: LAYOUT_TYPE) {
        this._layoutType = value;
    }

    get tags(): Array<string> {
        return this._tags;
    }

    get tagsTextInput(): string {
        return this._tagsTextInput;
    }

    set tagsTextInput(value: string) {
        this._tagsTextInput = value;
    }

    set tags(value: Array<string>) {
        this._tags = value;
    }

    hasCardsSection() : boolean {
        return !!this._sections ? this._sections.some(section => section.cards.length > 0) : false;
    }

    cardIdsSection(): Array<string> {
        return !!this._sections ? this._sections.reduce((acc, section) => [...acc, ...section.cardIds], []) : [];
    }

    sortSections(value: Array<String>)  {
        return this._sections.sort((a, b) => value.indexOf(a.id) - value.indexOf(b.id));
    }

    isMyBoard(): boolean {
        return this.owner.userId === model.me.userId;
    }

    isLayoutFree(): boolean {
        return this.layoutType == LAYOUT_TYPE.FREE;
    }

    isLayoutHorizontal(): boolean {
        return this.layoutType == LAYOUT_TYPE.HORIZONTAL;
    }

    isLayoutVertical(): boolean {
        return this.layoutType == LAYOUT_TYPE.VERTICAL;
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
