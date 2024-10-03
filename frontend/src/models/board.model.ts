//import { Behaviours, model, Shareable } from "entcore";

import { Card, ICardItemResponse } from "./card.model";
import { FOLDER_TYPE } from "../core/enums/folder-type.enum";
import {} from "edifice-ts-client";
import { LAYOUT_TYPE } from "../core/enums/layout-type.enum";
import { Section } from "~/providers/BoardProvider/types";

export interface IBoardItemResponse {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundUrl: string;
  cardIds: Array<string>;
  sections: Section[];
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
  canComment: boolean;
  displayNbFavorites: boolean;
  rights: any[];
  cards: Card[];
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
  backgroundUrl?: string;
  folderId?: string;
  cardIds?: Array<string>;
  sectionIds?: Array<string>;
  tags?: Array<string>;
  public?: boolean;
  layoutType?: LAYOUT_TYPE;
  canComment?: boolean;
  displayNbFavorites?: boolean;
}

export interface SectionPayload {
  id?: string;
  title?: string;
  cardIds?: string[];
  boardId: string;
  displayed?: boolean;
  sectionIds?: string[];
}

export interface ISection {
  title: string;
  cardIds?: Array<string>;
}

export interface IBoardOwner {
  userId: string;
  displayName: string;
}

export class BoardForm {
  private _id: string;
  private _title: string;
  private _description: string;
  private _imageUrl: string;
  private _backgroundUrl: string;
  private _folderId: string;
  private _cardIds: Array<string>;
  private _sectionIds: Array<string>;
  private _public: boolean;
  private _tags: Array<string>;
  private _tagsTextInput: string;
  private _layoutType: LAYOUT_TYPE;
  private _canComment: boolean;
  private _displayNbFavorites: boolean;

  constructor() {
    this._id = "";
    this._title = "";
    this._description = "";
    this._imageUrl = "";
    this._backgroundUrl = "";
    this._folderId = "";
    this._cardIds = [];
    this._sectionIds = [];
    this._public = false;
    this._tags = [];
    this._layoutType = LAYOUT_TYPE.FREE;
    this._tagsTextInput = "";
    this._canComment = false;
    this._displayNbFavorites = false;
  }

  build(board: Board): BoardForm {
    this.id = board.id;
    this.title = board.title;
    this.description = board.description;
    this.imageUrl = board.imageUrl;
    this.backgroundUrl = board.backgroundUrl;
    this.folderId = board.folderId;
    this.tags = board.tags;
    this.tagsTextInput = board.tagsTextInput;
    this.public = board.isPublished;
    this.layoutType = board.layoutType;
    this.canComment = board.canComment;
    this.displayNbFavorites = board.displayNbFavorites;
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

  get backgroundUrl(): string {
    return this._backgroundUrl;
  }

  set backgroundUrl(value: string) {
    this._backgroundUrl = value;
  }

  get folderId(): string {
    return this._folderId;
  }

  set folderId(value: string) {
    this._folderId =
      value === FOLDER_TYPE.MY_BOARDS || value === FOLDER_TYPE.DELETED_BOARDS
        ? ""
        : value;
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

  get canComment(): boolean {
    return this._canComment;
  }

  set canComment(value: boolean) {
    this._canComment = value;
  }

  get displayNbFavorites(): boolean {
    return this._displayNbFavorites;
  }

  set displayNbFavorites(value: boolean) {
    this._displayNbFavorites = value;
  }

  isLayoutFree(): boolean {
    return this.layoutType == LAYOUT_TYPE.FREE;
  }

  isValid(): boolean {
    return (
      this.title !== null &&
      this.title !== "" &&
      this.imageUrl != null &&
      this.imageUrl !== "" &&
      this.layoutType !== null
    );
  }

  toJSON(): IBoardPayload {
    const payload: IBoardPayload = {};

    if (this.title) {
      payload.title = this.title;
    }
    if (this.description != null) {
      payload.description = this.description;
    }
    if (this.imageUrl) {
      payload.imageUrl = this.imageUrl;
    }

    if (this.backgroundUrl != null) {
      payload.backgroundUrl = this.backgroundUrl;
    }

    if (this.folderId) {
      payload.folderId = this.folderId;
    }

    if (this.cardIds) {
      payload.cardIds = this.cardIds;
    }

    if (this.sectionsIds && this.sectionsIds.length > 0) {
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

    if (this.canComment != null) {
      payload.canComment = this.canComment;
    }

    if (this.id && this.id != "") {
      payload.id = this.id;
    }

    if (this.displayNbFavorites != null) {
      payload.displayNbFavorites = this.displayNbFavorites;
    }

    return payload;
  }
}

export class Board /*implements Shareable*/ {
  public _id: string;
  public title: string;
  public imageUrl: string;
  public backgroundUrl: string;
  public description: string;
  public cardIds: Array<string>;
  public sections: Array<Section>;
  public tags: Array<string>;
  public layoutType: LAYOUT_TYPE;
  public tagsTextInput: string;
  public nbCards: number;
  public nbCardsSections: number;
  public modificationDate: string;
  public creationDate: string;
  public folderId: string;
  public isPublished: boolean;
  public deleted: boolean;
  public canComment: boolean;
  public displayNbFavorites: boolean;
  public cards: Card[];

  // Share resource properties
  public shared: any[];
  public rights: any[];
  public owner: IBoardOwner;
  public myRights: any;

  constructor() {
    this._id = "";
    this.title = "";
    this.imageUrl = "";
    this.backgroundUrl = "";
    this.description = "";
    this.cardIds = [];
    this.sections = [];
    this.layoutType = LAYOUT_TYPE.FREE;
    this.tags = [];
    this.tagsTextInput = "";
    this.nbCards = 0;
    this.nbCardsSections = 0;
    this.modificationDate = "";
    this.creationDate = "";
    this.folderId = "";
    this.isPublished = false;
    this.owner = { userId: "", displayName: "" };
    this.shared = [];
    this.rights = [];
    this.deleted = false;
    this.canComment = false;
    this.displayNbFavorites = false;
    this.cards = [];
    return this;
  }

  build(data: IBoardItemResponse): Board {
    this._id = data._id;
    this.title = data.title;
    this.imageUrl = data.imageUrl;
    this.backgroundUrl = data.backgroundUrl;
    this.description = data.description;
    this.cardIds = data.cardIds;
    this.sections = data.sections;
    this.layoutType = data.layoutType;
    this.tags = data.tags;
    this.tagsTextInput = data.tags
      ? data.tags
          .map((tag: string) => "#" + tag)
          .toString()
          .replace(/,/g, " ")
      : "";

    this.nbCards = data.nbCards;
    this.nbCardsSections = data.nbCardsSections;
    this.modificationDate = data.modificationDate;
    this.creationDate = data.creationDate;
    this.folderId = data.folderId;
    this.isPublished = data.public;
    this.owner = { userId: data.ownerId, displayName: data.ownerName };
    this.shared = data.shared;
    this.cards = data.cards
      ? data.cards.map((cardData) =>
          new Card().build(cardData as unknown as ICardItemResponse),
        )
      : [];
    this.sections = data.sections
      ? data.sections.map((sectionData: Section) => ({
          ...sectionData,
          cards: sectionData.cards
            ? sectionData.cards.map((cardData) =>
                new Card().build(cardData as unknown as ICardItemResponse),
              )
            : [],
        }))
      : [];
    this.rights = data.rights;
    this.deleted = data.deleted;
    this.canComment = data.canComment;
    this.displayNbFavorites = data.displayNbFavorites;
    return this;
  }

  get sectionsIds(): Array<string> {
    return this.sections.map((section) => section._id);
  }

  hasCardsSection(): boolean {
    return this.sections
      ? this.sections.some((section) => section.cards.length > 0)
      : false;
  }

  // cardIdsSection(): Array<string> {
  //     return !!this._sections ? this._sections.reduce((acc, section) => [...acc, ...section.cardIds], []) : [];
  // }

  sortSections(value: Array<string>) {
    return this.sections.sort(
      (a, b) => value.indexOf(a._id) - value.indexOf(b._id),
    );
  }

  /*isMyBoard(): boolean {
        return this.owner.userId === model.me.userId;
    }*/

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
    /*this.all = data.all.map((board: IBoardItemResponse) =>
          Behaviours.applicationsBehaviours.magneto.resource(
            new Board().build(board),
          ),
        );*/
    this.all = [];
    this.page = data.page;
    this.pageCount = data.pageCount;
  }
}
