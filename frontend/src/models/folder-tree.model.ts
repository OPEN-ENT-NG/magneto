export interface IFolderTreeNavItem {
  id: string;
  title: string;
  parentId: string;
  isOpened?: boolean;
  ownerId?: string;
  shared?: any[];
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

  /**
   * Folder icon CSS class (optional)
   */
  private _iconClass: string;

  /**
   * List of children folders
   */
  private _children: Array<FolderTreeNavItem>;

  /**
   * Parent folder identifier
   */
  private _parentId: string;

  /**
   * Is opened in the folder tree or not
   */
  private _isOpened: boolean;

  /**
   * Id of folder owner
   */
  private _ownerId: string;

  /**
   * People with whom the folder is shared
   */
  private _shared: any[];

  constructor(
    folder: IFolderTreeNavItem,
    isOpened?: boolean,
    iconClass?: string,
  ) {
    this._id = folder.id;
    this._name = folder.title;
    this._parentId = folder.parentId;
    this._children = [];
    this._iconClass = iconClass ? iconClass : "";
    this._isOpened = isOpened !== null && isOpened ? isOpened : false;
    this._ownerId = folder.ownerId ? folder.ownerId : "";
    this._shared = folder.shared ? folder.shared : [];
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

  get iconClass(): string {
    return this._iconClass;
  }

  set iconClass(value: string) {
    this._iconClass = value;
  }

  get children(): Array<FolderTreeNavItem> {
    return this._children;
  }

  set children(value: Array<FolderTreeNavItem>) {
    this._children = value;
  }

  get parentId(): string {
    return this._parentId;
  }

  set parentId(value: string) {
    this._parentId = value;
  }

  get isOpened(): boolean {
    return this._isOpened;
  }

  set isOpened(value: boolean) {
    this._isOpened = value;
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
   * Open all folders from the given children folder to the current folder
   * @param folderId Folder identifier
   */
  openChildrenToId(folderId: string): void {
    if (this.childrenContainsId(folderId)) {
      this._isOpened = true;
      if (this.children) {
        this.children.forEach((folder: FolderTreeNavItem) => {
          folder.openChildrenToId(folderId);
        });
      }
    }
  }

  /**
   * Populate/Update the children list from the given folder list
   * @param folders Folder list
   */
  buildFolders(folders: Array<IFolderTreeNavItem>): FolderTreeNavItem {
    const childrenFolders: Array<IFolderTreeNavItem> = folders.filter(
      (folder: IFolderTreeNavItem) => folder.parentId === this._id,
    );

    const newChildren: Array<FolderTreeNavItem> = [];

    childrenFolders.forEach((folder: IFolderTreeNavItem) => {
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
