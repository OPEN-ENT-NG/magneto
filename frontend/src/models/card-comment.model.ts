export interface ICardItemCommentResponse {
  _id?: string;
  ownerId: string;
  ownerName: string;
  creationDate: string;
  modificationDate: string;
  content: string;
}

export interface ICardCommentsResponse {
  count: number;
  all: Array<ICardItemCommentResponse>;
}

export class CardComment {
  private _id: string;
  private _ownerId: string;
  private _ownerName: string;
  private _creationDate: string;
  private _modificationDate: string;
  private _content: string;

  constructor() {
    this._id = "";
    this._ownerId = "";
    this._ownerName = "";
    this._creationDate = "";
    this._modificationDate = "";
    this._content = "";
    return this;
  }

  build(data: ICardItemCommentResponse): CardComment {
    if (data == null) return this;
    this._id = data._id ? data._id : "";
    this._ownerId = data.ownerId;
    this._ownerName = data.ownerName;
    this._creationDate = data.creationDate;
    this._modificationDate = data.modificationDate;
    this._content = data.content;
    return this;
  }

  get id(): string {
    return this._id;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get creationDate(): string {
    return this._creationDate;
  }

  get modificationDate(): string {
    return this._modificationDate;
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  set ownerId(value: string) {
    this._ownerId = value;
  }

  get ownerName(): string {
    return this._ownerName;
  }

  set ownerName(value: string) {
    this._ownerName = value;
  }
}

export class CardComments {
  all: Array<CardComment>;
  count: number;

  constructor(data: ICardCommentsResponse) {
    this.all = data.all.map((cardComment: ICardItemCommentResponse) =>
      new CardComment().build(cardComment),
    );
    this.count = data.count;
  }
}
