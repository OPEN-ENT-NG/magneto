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
  private _deleted: boolean;
  private _isPublic: boolean;

  constructor(folder: IFolderTreeNavItem /*, iconClass?: string*/) {
    this._id = folder.id;
    this._name = folder.title;
    this._children = [];
    // this._iconClass = iconClass ? iconClass : "";
    this._ownerId = folder.ownerId ? folder.ownerId : "";
    this._shared = folder.shared ? folder.shared : [];
    this._section = folder.section || false;
    this._deleted = false;
    this._isPublic = false;
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

  get deleted(): boolean {
    return this._deleted;
  }

  set deleted(value: boolean) {
    this._deleted = value;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  set isPublic(value: boolean) {
    this._isPublic = value;
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

  setFolderFieldValue(
    folders: Folder[],
    fieldName: string,
    fieldValue: any,
  ): Folder[] {
    return folders.map(
      (folder: Folder) => ((folder as any)[fieldName] = fieldValue),
    );
  }

  /**
   * Populate/Update the children list from the given folder list
   * @param folders Folder list
   */
  buildFolders(folders: Array<Folder>): FolderTreeNavItem {
    const isOrphanedRestored = (folder: Folder): boolean => {
      if (folder.deleted || !folder.parentId) {
        return false;
      }
      const parentFolder = folders.find(f => f.id === folder.parentId);
      return parentFolder ? parentFolder.deleted : false;
    };

    const childrenFolders: Array<Folder> = folders.filter((folder: Folder) => {
      if (this._id === FOLDER_TYPE.MY_BOARDS) {
        this.section = true;
        return !folder.deleted && (!folder.parentId || isOrphanedRestored(folder));
      } else if (this._id === FOLDER_TYPE.DELETED_BOARDS) {
        this.section = true;
        return folder.deleted && (!folder.parentId || !folders.find(f => f.id === folder.parentId)?.deleted);
      } else {
        return folder.parentId === this._id && folder.deleted === this.deleted;
      }
    });

    const newChildren: Array<FolderTreeNavItem> = [];

    childrenFolders.forEach((folder: Folder) => {
      const childMatch: FolderTreeNavItem | undefined = this.children.find(
        (f: FolderTreeNavItem) => f.id === folder.id && f.name === folder.title
      );

      if (childMatch === undefined) {
        const newChild = new FolderTreeNavItem({
          id: folder.id,
          title: folder.title,
          parentId: folder.parentId || "",
          ownerId: folder.ownerId,
          shared: folder.shared,
        });
        newChild.deleted = folder.deleted;
        newChild.isPublic = folder.isPublic;
        newChildren.push(newChild.buildFolders(folders));
      } else {
        newChildren.push(childMatch.buildFolders(folders));
      }
    });

    this.children = newChildren;
    return this;
  }
}
