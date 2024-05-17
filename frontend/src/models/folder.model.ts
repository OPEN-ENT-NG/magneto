import { FolderTreeNavItem } from "./folder-tree.model";

export interface IFolderResponse {
  _id: string;
  title: string;
  parentId: string;
  ownerId: string;
  shared?: any[];
}

export interface IFolderForm {
  id: string;
  title: string;
}

export class Folder {
  private _id: string;
  private _title: string;
  private _parentId: string;
  private _ownerId: string;
  private _shared: any[];

  constructor() {
    this._id = "";
    this._title = "";
    this._parentId = "";
    this._ownerId = "";
    this._shared = [];
    return this;
  }

  build(data: IFolderResponse): Folder {
    this._id = data._id;
    this._title = data.title;
    this._parentId = data.parentId;
    this._ownerId = data.ownerId;
    this._shared = data.shared ? data.shared : [];
    return this;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get parentId(): string {
    return this._parentId;
  }

  set parentId(value: string) {
    this._parentId = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  set ownerId(value: string) {
    this._ownerId = value;
  }

  get shared(): any[] {
    return this._shared;
  }

  set shared(value: any[]) {
    this._shared = value;
  }

  isMyFolder(): boolean {
    return false; //todo
    // return this.ownerId === model.me.userId;
  }

  navItemToFolder(navItem: FolderTreeNavItem): Folder {
    const finalFolder: Folder = new Folder();
    finalFolder.id = navItem.id;
    finalFolder.title = navItem.name;
    finalFolder.parentId = navItem.parentId;
    finalFolder.ownerId = navItem.ownerId;
    finalFolder.shared = navItem.shared;

    return finalFolder;
  }
}
