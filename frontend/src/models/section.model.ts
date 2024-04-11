import { Card } from "./card.model";

export interface ISectionItemResponse {
  _id: string;
  title: string;
  cardIds: Array<string>;
  boardId: string;
  displayed?: boolean;
}

export interface ISectionDeleteParams {
  sectionIds: Array<string>;
  boardId: string;
  deleteCards: boolean;
}

export interface ISectionBoardParamsRequest {
  sectionIds: Array<string>;
  boardId: string;
}

export interface ISectionsResponse {
  all: Array<ISectionItemResponse>;
}

export interface ISectionPayload {
  id?: string;
  title?: string;
  cardIds?: Array<string>;
  boardId?: string;
  displayed?: boolean;
}

export class SectionForm {
  private _id: string;
  private _title: string;
  private _cardIds: Array<string>;
  private _boardId: string;
  private _displayed?: boolean;
  constructor() {
    this._id = "";
    this._title = "";
    this._cardIds = [];
    this._boardId = "";
  }

  build(section: Section): SectionForm {
    this.id = section.id;
    this.title = section.title;
    this.cardIds = section.cardIds;
    this.boardId = section.boardId;
    if (section.displayed !== undefined) this.displayed = section.displayed;
    return this;
  }

  buildNew(boardId: string): SectionForm {
    this.title = "";
    this.cardIds = [];
    this.boardId = boardId;
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

  get boardId(): string {
    return this._boardId;
  }

  set boardId(value: string) {
    this._boardId = value;
  }

  get cardIds(): Array<string> {
    return this._cardIds;
  }

  set cardIds(value: Array<string>) {
    this._cardIds = value;
  }

  addCardId(value: string) {
    this._cardIds.push(value);
  }

  // get displayed(): boolean {
  //     return this._displayed;
  // }

  set displayed(value: boolean) {
    this._displayed = value;
  }
  isValid(): boolean {
    return this.title !== null && this.title !== "";
  }

  toJSON(): ISectionPayload {
    const payload: ISectionPayload = {};

    if (this.title) {
      payload.title = this.title;
    }
    if (this.boardId) {
      payload.boardId = this.boardId;
    }
    if (this.id && this.id != "") {
      payload.id = this.id;
    }
    payload.cardIds = this.cardIds;

    if (this.displayed !== undefined && this.displayed !== null) {
      payload.displayed = this.displayed;
    }
    return payload;
  }
}

export class Section {
  private _id: string;
  private _title: string;
  private _cardIds: Array<string>;
  private _boardId: string;
  private _page: number;
  private _cards: Card[];
  private _displayed?: boolean;

  constructor() {
    this._id = "";
    this._title = "";
    this._boardId = "";
    this._cardIds = [];
    this._cards = [];
    this._page = 0;
    this._displayed = false;
    return this;
  }

  build(data: ISectionItemResponse): Section {
    this._id = data._id;
    this._title = data.title;
    this._boardId = data.boardId;
    this._cardIds = data.cardIds;
    this._cards = [];
    this._page = 0;
    this._displayed = data.displayed !== false;
    return this;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get boardId(): string {
    return this._boardId;
  }

  get cardIds(): Array<string> {
    return this._cardIds;
  }

  get page(): number {
    return this._page;
  }

  set page(value: number) {
    this._page = value;
  }

  get cards(): Card[] {
    return this._cards;
  }

  // get displayed(): boolean {
  //     return this._displayed;
  // }

  set displayed(value: boolean) {
    this._displayed = value;
  }
}

export class Sections {
  all: Array<Section>;

  constructor(data: ISectionsResponse) {
    this.all = data.all.map((section: ISectionItemResponse) =>
      new Section().build(section),
    );
  }
}
