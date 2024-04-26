import { Folder } from "./folder.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";

export interface IFolderTreeNavItem {
  id: string;
  title: string;
  parentId: string;
  isOpened?: boolean;
  ownerId?: string;
  shared?: any[];
  section?: boolean;
}

export class FolderTreeNavItem {
  /**
   * Folder identifier
   */
  private _id: string;

  /**
   * Folder name
   */
  private _name: string;

  // /**
  //  * Folder icon CSS class (optional)
  //  */
  // private _iconClass: string;

  /**
   * List of children folders
   */
  private _children: Array<FolderTreeNavItem>;

  /**
   * Id of folder owner
   */
  private _ownerId: string;

  /**
   * People with whom the folder is shared
   */
  private _shared: any[];

  private _section: boolean;

  constructor(folder: IFolderTreeNavItem /*, iconClass?: string*/) {
    this._id = folder.id;
    this._name = folder.title;
    this._children = [];
    // this._iconClass = iconClass ? iconClass : "";
    this._ownerId = folder.ownerId ? folder.ownerId : "";
    this._shared = folder.shared ? folder.shared : [];
    this._section = false;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  // get iconClass(): string {
  //     return this._iconClass;
  // }

  // set iconClass(value: string) {
  //     this._iconClass = value;
  // }

  get children(): Array<FolderTreeNavItem> {
    return this._children;
  }

  set children(value: Array<FolderTreeNavItem>) {
    this._children = value;
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

  get section(): boolean {
    return this._section;
  }

  set section(value: boolean) {
    this._section = value;
  }

  /**
   * Check if the folder has a children (or sub-children) with the given id
   * @param folderId Folder identifier
   */
  childrenContainsId(folderId: string): boolean {
    return (
      this.id == folderId ||
      this.children.some(
        (folder: FolderTreeNavItem) =>
          folder.id === folderId || folder.childrenContainsId(folderId),
      )
    );
  }

  /**
   * Populate/Update the children list from the given folder list
   * @param folders Folder list
   */
  buildFolders(folders: Array<Folder>): FolderTreeNavItem {
    const childrenFolders: Array<Folder> = folders.filter((folder: Folder) => {
      if (
        this._id == FOLDER_TYPE.MY_BOARDS ||
        this._id == FOLDER_TYPE.DELETED_BOARDS
      ) {
        this.section = true;
        return !folder.parentId;
      } else {
        return folder.parentId === this._id;
      }
    });

    const newChildren: Array<FolderTreeNavItem> = [];

    childrenFolders.forEach((folder: Folder) => {
      const childMatch: FolderTreeNavItem = this.children.find(
        (f: FolderTreeNavItem) => f.id === folder.id && f.name === folder.title,
      );

      if (childMatch === undefined) {
        newChildren.push(new FolderTreeNavItem(folder).buildFolders(folders));
      } else {
        newChildren.push(childMatch.buildFolders(folders));
      }
    });

    this.children = newChildren;

    return this;
  }
}
