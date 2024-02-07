import {angular, idiom as lang, model, ng, notify, toasts} from "entcore";
import {IScope} from "angular";
import {BoardsService, IBoardsService, IFoldersService} from "../services";
import {
    Board,
    BoardForm,
    Boards,
    Folder,
    FolderTreeNavItem,
    IBoardsParamsRequest,
    IFolderForm,
    IFolderTreeNavItem
} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError, AxiosResponse} from "axios";
import {InfiniteScrollService} from "../shared/services";
import {Subject} from "rxjs";
import {FOLDER_TYPE} from "../core/enums/folder-type.enum";
import {BoardsFilter} from "../models/boards-filter.model";
import {hasRight} from "../utils/rights.utils";
import {Draggable} from "../models/draggable.model";
import {COLLECTION_NAVBAR_VIEWS} from "../core/enums/collection-navbar.enum";
import {ShareUtils} from "../utils/share.utils";

interface IViewModel {
    openedFolder: Folder;
    selectedBoardIds: Array<string>;
    selectedBoards: Array<Board>;
    selectedFolderIds: Array<string>;
    selectedFolders: Array<Folder>;
    selectedUpdateBoardForm: BoardForm;
    selectedUpdateFolderForm: IFolderForm;

    isLoading: boolean;

    /* Lightbox display conditions */
    displayBoardLightbox: boolean;
    displayDeleteBoardLightbox: boolean;
    displayShareBoardLightbox: boolean;
    displayShareFolderLightbox : boolean;
    displayUpdateBoardLightbox: boolean;
    displayUpdateFolderLightbox: boolean;
    displayFolderLightbox: boolean;
    displayMoveBoardLightbox: boolean;
    displayCollectionLightbox: boolean;

    boards: Array<Board>;
    folders: Array<Folder>;

    deletedFolders: Array<Folder>;
    folderNavTrees: Array<FolderTreeNavItem>;
    folderMoveNavTrees: Array<FolderTreeNavItem>;
    folderNavTreeSubject: Subject<FolderTreeNavItem>;

    filter: {
        page: number,
        isTrash: boolean,
        isPublic: boolean,
        searchText: string
    };

    infiniteScrollService: InfiniteScrollService;
    draggable: Draggable;
    draggedItem: any;

    COLLECTION_NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;

    getBoards(): Promise<void>;

    getFolders(): void;

    getDeletedFolders(): Promise<Array<Folder>>;

    getCurrentFolderChildren(): void;

    openCreateForm(): void;

    openDeleteForm(): void;

    openShareForm(): void;

    openPublicShareForm(): void;

    openPropertiesForm(): void;

    openBoardOrFolder(): Promise<void>;

    openRenameFolderForm(): void;

    onFormSubmit(createdBoardId?: { id: string }): Promise<void>;

    initTrees(): void;

    updateTrees(): void;

    setFolderParentIds(): void;

    proceedOnDragAndDrop(originalBoard: Board, targetItem: Folder): Promise<void>;

    resetDragAndDrop(): void;

    switchFolder(folder: FolderTreeNavItem): Promise<void>;

    submitFolderForm(): Promise<void>;

    onSearchBoard(searchText: string): Promise<void>;

    onScroll(): void;

    resetBoards(): void;

    isOwner(folderId: string): boolean;

    folderIdHasShareRight(folderId: string, right: string): boolean;

    folderHasShareRight(folder: Folder, right: string): boolean;

    folderIsShared(folderId: string): boolean;

    restoreBoardsOrFolders(): Promise<void>;

    moveBoards(): Promise<void>;

    openCardCollection(): void;

    duplicateBoard(): Promise<void>;

    closeSideNavFolders(): void;

    openSideNavFolders(): void;

    initDraggable(): void;

    areSelectedBoardsMine(): boolean;

    areSelectedFoldersMine(): boolean;

    hasDuplicationRight(): boolean;

    hasRenameRight(): boolean;

    folderHasCreationRight(): boolean;

    hasRight: typeof hasRight;

}

interface IBoardsScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {

    openedFolder: Folder;
    selectedBoardIds: Array<string>;
    selectedBoards: Array<Board>;
    selectedFolderIds: Array<string>;
    selectedFolders: Array<Folder>;
    selectedUpdateBoardForm: BoardForm;
    selectedUpdateFolderForm: IFolderForm;

    isLoading: boolean;

    displayBoardLightbox: boolean;
    boards: Array<Board>;
    folders: Array<Folder>;
    deletedFolders: Array<Folder>;
    currentFolderChildren: Array<Folder>;
    folderNavTrees: Array<FolderTreeNavItem>;
    folderMoveNavTrees: Array<FolderTreeNavItem>;
    displayDeleteBoardLightbox: boolean;
    displayShareBoardLightbox: boolean;
    displayShareFolderLightbox: boolean;
    displayPublicShareBoardLightbox: boolean;
    displayUpdateBoardLightbox: boolean;
    displayUpdateFolderLightbox: boolean;
    displayFolderLightbox: boolean;
    displayMoveBoardLightbox: boolean;
    displayCollectionLightbox: boolean;
    displayEnterSharedFolderWarningLightbox: boolean;
    displayExitSharedFolderWarningLightbox: boolean;
    displayMoveNoRightInFolderLightbox: boolean;
    isFromMoveBoardLightbox: boolean;
    magnetoStandalone: boolean;
    dragAndDropBoard: Board;
    dragAndDropTarget: Folder;
    dragAndDropInitialFolder: Folder;

    folderNavTreeSubject: Subject<FolderTreeNavItem>;

    filter: BoardsFilter;
    infiniteScrollService: InfiniteScrollService;
    hasRight: typeof hasRight = hasRight;
    draggable: Draggable;
    COLLECTION_NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;
    draggedItem: any;

    constructor(private $scope: IBoardsScope,
                private $location: ng.ILocationService,
                private $timeout: ng.ITimeoutService,
                private $window: ng.IWindowService,
                private boardsService: IBoardsService,
                private foldersService: IFoldersService) {
        this.$scope.vm = this;
        this.COLLECTION_NAVBAR_VIEWS = COLLECTION_NAVBAR_VIEWS;
        this.infiniteScrollService = new InfiniteScrollService;
        this.folderNavTreeSubject = new Subject<FolderTreeNavItem>();
    }

    async $onInit(): Promise<void> {
        this.isLoading = true;
        this.openedFolder = null;
        this.displayBoardLightbox = false;
        this.displayDeleteBoardLightbox = false;
        this.displayFolderLightbox = false;
        this.displayMoveBoardLightbox = false;
        this.displayCollectionLightbox = false;
        this.displayShareBoardLightbox = false;
        this.displayShareFolderLightbox = false;
        this.displayPublicShareBoardLightbox = false;
        this.displayEnterSharedFolderWarningLightbox = false;
        this.displayExitSharedFolderWarningLightbox = false;
        this.displayMoveNoRightInFolderLightbox = false;
        this.isFromMoveBoardLightbox = false;
        this.magnetoStandalone = this.$window.magnetoStandalone == "true";

        this.filter = new BoardsFilter();
        this.boards = [];
        this.folders = [];
        this.currentFolderChildren = [];
        this.selectedBoardIds = [];
        this.selectedBoards = [];
        this.selectedFolderIds = [];
        this.selectedFolders = [];
        this.folderNavTrees = [];
        this.folderMoveNavTrees = [];
        this.selectedUpdateBoardForm = new BoardForm();
        this.selectedUpdateFolderForm = {id: null, title: ''};
        this.deletedFolders = await this.getDeletedFolders();
        this.getFolders();
        this.initDraggable();
        await this.getBoards();
    }

    /**
     * Callback on board search.
     */
    onSearchBoard = async (): Promise<void> => {
        this.filter.page = 0;
        this.boards = [];
        this.getCurrentFolderChildren();
        await this.getBoards();
    }

    initDraggable = (): void => {
        const that = this;

        this.draggable = {
            dragConditionHandler(event: DragEvent, content?: any): boolean {
                return that.filter.isMyBoards;
            },
            dragStartHandler(event: DragEvent, content?: any): void {
                try {
                    event.dataTransfer.setData('application/json', JSON.stringify(content));
                    that.draggedItem = content;
                } catch (e) {
                    event.dataTransfer.setData('text', JSON.stringify(content));
                }
            },
            dragEndHandler(event: DragEvent, content?: any): void {
            },
            dropConditionHandler(event: DragEvent, content?: any): boolean {
                let folderTarget: Folder = angular.element(event.srcElement).scope().vm.folder || angular.element(event.srcElement).scope().vm.folderTree;
                let isTargetAlreadyMyParent: boolean = folderTarget && folderTarget.id === that.draggedItem.folderId;

                // Check if target is self
                let isTargetMyself = that.draggedItem && folderTarget && folderTarget.id === that.draggedItem.id;

                // Check if dragged item is not archived
                let isArchivedItem = that.draggedItem.deleted;

                // Check if target folder is not public
                let isPublicTarget = folderTarget && folderTarget.id === FOLDER_TYPE.PUBLIC_BOARDS;

                return !isTargetAlreadyMyParent && !isTargetMyself && !isArchivedItem && !isPublicTarget;
            },
            async dragDropHandler(event: DragEvent, content?: any): Promise<void> {
                let originalBoard: Board = new Board().build(JSON.parse(event.dataTransfer.getData("application/json")));
                let targetItem: Folder = angular.element(event.srcElement).scope().vm.folder || angular.element(event.srcElement).scope().vm.folderTree;

                let originalBoardData: Board = that.boards.find((board: Board) => board.id == originalBoard.id);
                that.dragAndDropInitialFolder = !!originalBoardData.folderId ? that.folders.find((folder: Folder) => folder.id == originalBoardData.folderId)
                    : new Folder();
                if (originalBoardData.owner.userId != model.me.userId) { //not board owner
                    that.handleNoRightsDragAndDrop(that, originalBoard, targetItem);
                    return ;
                } else if ((that.dragAndDropInitialFolder.ownerId == model.me.userId || that.dragAndDropInitialFolder.id == undefined
                        || that.folderHasShareRight(that.dragAndDropInitialFolder, "publish"))
                        && (that.folderHasShareRight(targetItem, "publish") || (targetItem.ownerId == model.me.userId && !!targetItem.shared))) { //initial folder owner/has right, target folder has right OR is owner + shared
                    that.dragAndDropBoard = originalBoard;
                    that.dragAndDropTarget = targetItem;
                    that.displayEnterSharedFolderWarningLightbox = true;
                    safeApply(that.$scope);
                } else if ((that.folderHasShareRight(that.dragAndDropInitialFolder, "publish") || (that.dragAndDropInitialFolder.ownerId == model.me.userId && !!that.dragAndDropInitialFolder.shared))
                    && (targetItem.ownerId == model.me.userId || targetItem.id == FOLDER_TYPE.MY_BOARDS)) { //initial folder has right OR is owner + shared, target folder owner
                    that.dragAndDropBoard = originalBoard;
                    that.dragAndDropTarget = targetItem;
                    that.displayExitSharedFolderWarningLightbox = true;
                    safeApply(that.$scope);
                } else if ((that.dragAndDropInitialFolder.ownerId == model.me.userId || that.dragAndDropInitialFolder.id == undefined)
                    && (targetItem.ownerId == model.me.userId || targetItem.id == FOLDER_TYPE.MY_BOARDS)) { //initial folder owner, target folder owner
                    await that.proceedOnDragAndDrop(originalBoard, targetItem);
                } else {
                    that.handleNoRightsDragAndDrop(that, originalBoard, targetItem);
                }
            }
        };
    }

    handleNoRightsDragAndDrop = (that: this, originalBoard: Board, targetItem: Folder) => {
        that.dragAndDropBoard = originalBoard;
        that.dragAndDropTarget = targetItem;
        that.displayMoveNoRightInFolderLightbox = true;
        safeApply(that.$scope);
    }

    proceedOnDragAndDrop = async (originalBoard: Board, targetItem: Folder, isFromMoveBoardLightbox?: boolean): Promise<void> => {
        let idTargetItem: string = targetItem.id;
        if (isFromMoveBoardLightbox) {
            await this.boardsService.moveBoardsToFolder(this.selectedBoardIds, idTargetItem);
            return ;
        }
        this.resetDragAndDrop();
        let idOriginalItem: string = originalBoard.id;

        if (this.selectedBoardIds.length > 0) {
            if (targetItem.id == FOLDER_TYPE.DELETED_BOARDS) {
                this.openDeleteForm();
            } else {
                await this.boardsService.moveBoardsToFolder(this.selectedBoardIds, idTargetItem);
                await this.onFormSubmit();
            }
            // Move several boards
        } else {
            // Move one board
            let draggedItemIds: string[] = this.boards.filter(board => board.id === idOriginalItem).map(board => board.id);
            if (targetItem.id == FOLDER_TYPE.DELETED_BOARDS) {
                this.selectedBoardIds = draggedItemIds;
                this.openDeleteForm();
            } else {
                await this.boardsService.moveBoardsToFolder(draggedItemIds, idTargetItem);
                await this.onFormSubmit();
            }
        }
        safeApply(this.$scope);
    }

    resetDragAndDrop = (): void => {
        this.displayEnterSharedFolderWarningLightbox = false;
        this.displayExitSharedFolderWarningLightbox = false;
        this.displayMoveNoRightInFolderLightbox = false;
        this.isFromMoveBoardLightbox = false;
        this.dragAndDropBoard = undefined;
        this.dragAndDropTarget = undefined;
        this.dragAndDropInitialFolder = undefined;

        safeApply(this.$scope);
    }

    /**
     * Switch current folder on select from folder tree.
     * @param folder folder to select
     */
    switchFolder = async (folder: FolderTreeNavItem): Promise<void> => {
        this.resetBoards();
        this.openedFolder = new Folder().build({
            _id: folder.id, title: folder.name,
            parentId: folder.parentId, ownerId: ''
        });

        // Update filter category
        this.filter.isMyBoards = folder.id === FOLDER_TYPE.MY_BOARDS
            || this.folders.some((f: Folder) => f.id === folder.id);
        this.filter.isPublic = folder.id === FOLDER_TYPE.PUBLIC_BOARDS;
        this.filter.isTrash = folder.id === FOLDER_TYPE.DELETED_BOARDS
            || this.deletedFolders.some((f: Folder) => f.id === folder.id);

        this.getCurrentFolderChildren();
        await this.getBoards();
    }

    /**
     * Callback on submit folder manage form:
     * - refresh folders
     */
    submitFolderForm = async (): Promise<void> => {
        await this.getFolders();
    }

    /**
     * Open create board form.
     */
    openCreateForm = (): void => {
        this.selectedUpdateBoardForm = new BoardForm();
        this.displayUpdateBoardLightbox = false;
        this.displayBoardLightbox = true;
    }

    /**
     * Open delete board form.
     */
    openDeleteForm = (): void => {
        this.displayDeleteBoardLightbox = true;
    }

    /**
     * Open share board form.
     */
    openShareForm = (): void => {
        if (this.filter.isMyBoards && this.selectedBoardIds.length == 1
            && this.selectedFolderIds.length == 0 && this.selectedBoards[0].isMyBoard()) {
            this.displayShareBoardLightbox = true;
        } else if (this.selectedFolderIds.length == 1 && this.selectedBoardIds.length == 0
            && this.isOwner(this.selectedFolderIds[0])) {
            this.displayShareFolderLightbox = true;
        }
    }

    /**
     * Open public share board form.
     */
    openPublicShareForm = (): void => {
        this.displayPublicShareBoardLightbox = true;
    }

    /**
     * Open board properties form.
     */
    openPropertiesForm = (): void => {
        let selectedUpdateBoard: Board = this.boards.find((board: Board) => board.id === this.selectedBoardIds[0]);
        this.selectedUpdateBoardForm = new BoardForm().build(selectedUpdateBoard);
        this.displayUpdateBoardLightbox = true;
        this.displayBoardLightbox = true;
    }

    /**
     * Open board or folder.
     */
    openBoardOrFolder = async (): Promise<void> => {
        if ((this.selectedBoardIds.length + this.selectedFolderIds.length) !== 1) {
            return;
        }

        if (this.selectedFolderIds.length > 0) {
            if (this.filter.isMyBoards) {
                this.openedFolder = this.folders.find((folder: Folder) =>
                    folder.id == this.selectedFolderIds[0]);
            } else {
                this.openedFolder = this.deletedFolders.find((folder: Folder) =>
                    folder.id == this.selectedFolderIds[0]);
            }

            this.getCurrentFolderChildren();
            this.resetBoards();
            await this.getBoards();

            this.folderNavTreeSubject.next(new FolderTreeNavItem(
                {
                    id: this.openedFolder.id,
                    title: this.openedFolder.title,
                    parentId: this.openedFolder.parentId
                }));
        } else {
            this.$location.path(`/board/view/${this.selectedBoardIds[0]}`);
        }
    }

    /**
     * Open rename folder form.
     */
    openRenameFolderForm = (): void => {
        let selectedUpdateFolder: Folder = this.folders.find((folder: Folder) => folder.id === this.selectedFolderIds[0]);
        this.selectedUpdateFolderForm.id = selectedUpdateFolder ? selectedUpdateFolder.id : null;
        this.selectedUpdateFolderForm.title = selectedUpdateFolder ? selectedUpdateFolder.title : '';
        this.displayUpdateFolderLightbox = true;
        this.displayFolderLightbox = true;
    }

    /**
     * Get all boards in current opened folder.
     */
    getBoards = async (): Promise<void> => {
        this.isLoading = true;
        const params: IBoardsParamsRequest = {
            folderId: this.openedFolder ? this.openedFolder.id : null,
            isPublic: this.filter.isPublic,
            isShared: true,
            isDeleted: this.filter.isTrash,
            searchText: this.filter.searchText,
            sortBy: 'modificationDate',
            page: this.filter.page
        };

        if (params.folderId == FOLDER_TYPE.MY_BOARDS ||
            params.folderId == FOLDER_TYPE.PUBLIC_BOARDS ||
            params.folderId == FOLDER_TYPE.DELETED_BOARDS)
            params.folderId = null;

        this.boardsService.getAllBoards(params)
            .then((res: Boards) => {
                if (res.all && res.all.length > 0) {
                    this.boards.push(...res.all);
                    this.infiniteScrollService.updateScroll();
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    /**
     * Get all user folders.
     */
    getFolders = (): void => {
        this.foldersService.getFolders(false)
            .then((res: Array<Folder>) => {
                this.folders = res;
                this.setFolderParentIds();
                this.getCurrentFolderChildren();
                if (this.folderNavTrees.length == 0) {
                    this.initTrees();
                } else {
                    this.updateTrees();
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    /**
     * Get all pre-deleted folders.
     */
    getDeletedFolders = (): Promise<Array<Folder>> => {
        return this.foldersService.getFolders(true);
    }

    /**
     * Get all folders in current opened folder.
     */
    getCurrentFolderChildren = (): void => {
        if (this.filter.isTrash) {
            this.currentFolderChildren = this.deletedFolders.filter((folder: Folder) =>
                folder.parentId == (this.openedFolder ? this.openedFolder.id : FOLDER_TYPE.DELETED_BOARDS));
        } else {
            this.currentFolderChildren = this.folders.filter((folder: Folder) =>
                (folder.parentId == (this.openedFolder ? this.openedFolder.id : FOLDER_TYPE.MY_BOARDS))
                && ((this.filter.searchText == '') || folder.title.includes(this.filter.searchText)));
        }
    }

    /**
     * Restore selected boards and/or folders from trash.
     */
    restoreBoardsOrFolders = async (): Promise<void> => {
        if (this.selectedBoardIds.length > 0) {
            await this.boardsService.restorePreDeleteBoards(this.selectedBoardIds);

        }
        if (this.selectedFolderIds.length > 0) {
            await this.foldersService.restorePreDeleteFolders(this.selectedFolderIds);
        }
        this.resetBoards();
        this.deletedFolders = await this.getDeletedFolders();
        this.getFolders();
        this.getCurrentFolderChildren();
        await this.getBoards();

    }

    /**
     * Open move board form.
     */
    moveBoards = async (): Promise<void> => {
        this.displayMoveBoardLightbox = true;
    }

    /**
     * Open card collection.
     */
    openCardCollection = (): void => {
        this.displayCollectionLightbox = true;
    }

    /**
     * Duplicate selected board.
     */
    duplicateBoard = async (): Promise<void> => {
        await this.boardsService.duplicateBoard(this.selectedBoardIds[0])
            .then((response: AxiosResponse) => {
                    if (response.status === 200 || response.status === 201) {
                        toasts.confirm('magneto.duplicate.elements.confirm');
                    } else {
                        toasts.warning('magneto.duplicate.elements.error')
                    }
                }
            );
        this.resetBoards();
        await this.getBoards();
    }

    areSelectedBoardsMine = (): boolean => {
        return this.selectedBoards.every((board: Board) => board.isMyBoard());
    }

    areSelectedFoldersMine = (): boolean => {
        return this.selectedFolders.every((folder: Folder) => folder.isMyFolder());
    }

    /**
     * Callback on form submit:
     * - refresh boards
     * - refresh folders / deleted folders
     */
    onFormSubmit = async (createdBoardId?: { id: string }): Promise<void> => {
        if (createdBoardId && createdBoardId.id) {
            this.$location.path(`/board/view/${createdBoardId.id}`);
            safeApply(this.$scope);
        } else {
            this.resetBoards();
            this.deletedFolders = await this.getDeletedFolders();
            this.getFolders();
            await this.getBoards();
        }
    }

    /**
     * Initialize folder navigation trees.
     */
    initTrees = (): void => {

        this.folderNavTrees = [];
        this.folderMoveNavTrees = [];

        this.folderNavTrees.push(new FolderTreeNavItem(
            {
                id: FOLDER_TYPE.MY_BOARDS, title: lang.translate('magneto.my.boards'),
                parentId: null
            }, null, "magneto-check-decagram")
            .buildFolders(this.folders));
        this.folderNavTrees.push(new FolderTreeNavItem(
            {
                id: FOLDER_TYPE.PUBLIC_BOARDS, title: lang.translate('magneto.lycee.connecte.boards'),
                parentId: null
            }, null, "magneto-earth"));
        this.folderNavTrees.push(new FolderTreeNavItem(
            {
                id: FOLDER_TYPE.DELETED_BOARDS, title: lang.translate('magneto.trash'),
                parentId: null
            }, null, "magneto-delete-forever")
            .buildFolders(this.deletedFolders));

        // Folder tree for board move lightbox
        this.folderMoveNavTrees.push(new FolderTreeNavItem(
            {
                id: FOLDER_TYPE.MY_BOARDS, title: lang.translate('magneto.my.boards'),
                parentId: null
            }, true, "magneto-check-decagram")
            .buildFolders(this.folders));

        this.folderNavTreeSubject.next(this.folderNavTrees[0]);
    }

    /**
     * Update folder navigation trees (add new folders and delete removed folders from tree).
     */
    updateTrees = (): void => {

        this.setFolderParentIds();

        this.folderNavTrees[0].buildFolders(this.folders);
        this.folderNavTrees[2].buildFolders(this.deletedFolders);

        // Folder tree for board move lightbox
        this.folderMoveNavTrees = [];
        this.folderMoveNavTrees.push(new FolderTreeNavItem(
            {
                id: FOLDER_TYPE.MY_BOARDS, title: lang.translate('magneto.my.boards'),
                parentId: null
            }, true, "magneto-check-decagram")
            .buildFolders(this.folders));
    }

    /**
     * Set parent ids for all folders.
     * If parentId is null, folder is a root folder in "My boards".
     * If parentId is null and folder is in trash, folder is a root folder in "Trash".
     */
    setFolderParentIds = (): void => {
        this.folders.forEach((folder: IFolderTreeNavItem) => {
            if (folder.parentId == null || (this.folders.find((f: Folder) => (f.id !== folder.id)
                && (folder.parentId === f.id)) === undefined)) {
                folder.parentId = FOLDER_TYPE.MY_BOARDS;
            }
        });

        this.deletedFolders.forEach((folder: IFolderTreeNavItem) => {
            if (folder.parentId == null || (this.deletedFolders.find((f: Folder) => (f.id !== folder.id)
                && (folder.parentId === f.id)) === undefined)) {
                folder.parentId = FOLDER_TYPE.DELETED_BOARDS;
            }
        });
    }

    /**
     * On scroll callback:
     * - load more boards if scroll is at the bottom of the page
     */
    onScroll = async (): Promise<void> => {
        if (this.boards.length > 0) {
            this.filter.nextPage();
            await this.getBoards();
        }
    }

    /**
     * Reset boards, page and search filters.
     */
    resetBoards = (): void => {
        this.filter.page = 0;
        this.filter.searchText = '';
        this.boards = [];
        this.selectedBoards = [];
        this.selectedBoardIds = [];
        this.selectedFolderIds = [];
        this.selectedUpdateBoardForm = new BoardForm();
        this.selectedUpdateFolderForm = {id: null, title: ''};
    }

    /**
     * Return true if user can share folder = is folder owner
     */
    isOwner = (folderId: string): boolean => {
        let selectedFolder: Folder = this.folders.find((folder: Folder) => folder.id == folderId);
        return  !!selectedFolder && selectedFolder.ownerId == model.me.userId;
    }

    /**
     * Return true if user has certain share right
     */
    folderIdHasShareRight = (folderId: string, right: string): boolean => {
        let selectedFolder: Folder = this.folders.find((folder: Folder) => folder.id == folderId);
        return this.folderHasShareRight(selectedFolder, right);
    }

    /**
     * Return true if user has certain share right
     */
    folderHasShareRight = (folder: Folder, right: string): boolean => {
        return ShareUtils.folderHasShareRights(folder, right);
    }

    /**
     * Return true if folder is not shared
     */
    folderIsShared = (folderId: string): boolean => {
        let parentFolder: Folder = this.folders.find((folder: Folder) => folder.id == folderId);

        return parentFolder.shared && parentFolder.shared.length > 0;
    }

    /**
     * Open folders side nav (for mobile view)
     */
    openSideNavFolders = (): void => {
        document.getElementById("sideNavMobile").style.width = "200px";
    }

    /**
     * Close folders side nav (for mobile view)
     */
    closeSideNavFolders = (): void => {
        document.getElementById("sideNavMobile").style.width = "0";
    };

    hasDuplicationRight = (): boolean => {
        let oneBoardSelectedOnly: boolean = this.selectedBoardIds.length == 1 && this.selectedFolderIds.length == 0;
        let isOwnerOrPublicOrShared: boolean =  !!this.selectedBoards.length && (this.selectedBoards[0].isMyBoard() || this.selectedBoards[0].public
            || (!this.folderIsShared(this.selectedBoards[0].folderId) && this.selectedBoards[0].myRights.contrib)
            || (this.folderIsShared(this.selectedBoards[0].folderId) && this.folderIdHasShareRight(this.selectedBoards[0].folderId, 'publish')));

        return oneBoardSelectedOnly && isOwnerOrPublicOrShared;
    };

    hasRenameRight = (): boolean => {
        let isMyBoardsAndOneBoardSelectedOnly: boolean = this.filter.isMyBoards && this.selectedFolderIds.length == 1 && this.selectedBoardIds.length == 0;
        let isFolderOwnerOrSharedWithRights: boolean = (this.isOwner(this.selectedFolderIds[0]) || this.folderIdHasShareRight(this.selectedFolderIds[0], 'manager'));

        return isMyBoardsAndOneBoardSelectedOnly && isFolderOwnerOrSharedWithRights;
    };

    folderHasCreationRight = (): boolean => {
        return ShareUtils.hasFolderCreationRight(this.openedFolder);
    }

    $onDestroy() {
    }
}

export const boardsController = ng.controller('BoardsController',
    ['$scope', '$location', '$timeout', '$window', 'BoardsService', 'FoldersService', Controller]);