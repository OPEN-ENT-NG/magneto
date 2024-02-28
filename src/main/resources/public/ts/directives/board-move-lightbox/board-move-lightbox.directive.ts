import {angular, model, ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Boards, Folder, FolderTreeNavItem} from "../../models";
import {boardsService} from "../../services";
import {FOLDER_TYPE, MAIN_PAGE_TITLE} from "../../core/enums/folder-type.enum";
import {safeApply} from "../../utils/safe-apply.utils";
import {ShareUtils} from "../../utils/share.utils";

interface IViewModel extends ng.IController, IBoardMoveProps {
    folderId: string;

    selectFolder(folder: FolderTreeNavItem): void;
    isFormValid(): boolean;
    closeForm(): void;
    submit(): Promise<void>;
}

interface IBoardMoveProps {
    display: boolean;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    initialFolder: Folder;
    targetFolder: Folder;
    fromMoveLightbox: boolean;
}

interface IBoardMoveScope extends IScope, IBoardMoveProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    folders: Array<Folder>;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    initialFolder: Folder;
    targetFolder: Folder;
    folderId: string;
    fromMoveLightbox: boolean;

    constructor(private $scope: IBoardMoveScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit(): void {
    }

    isFormValid = (): boolean => {
        return this.folderId !== undefined;
    }

    selectFolder = (folder: FolderTreeNavItem): void => {
        this.folderId = folder.id;
    }
    
    closeForm = (): void => {
        this.display = false;
    }

    submit = async (): Promise<void> => {
        try {
            this.$scope.$parent['vm'].selectedBoardIds = this.boardIds;
            let originalBoards: Board[] = [];
            this.boardIds.forEach((boardId: string) =>
                this.$scope.$parent['vm'].boards.map((board: Board) => {
                    if (boardId == board.id) originalBoards.push(board)
                }));

            let myBoards: Board[] = originalBoards.filter((board: Board) => board.owner.userId == model.me.userId);

            this.targetFolder = this.folderId == FOLDER_TYPE.MY_BOARDS ?
                new Folder().build({
                    _id: FOLDER_TYPE.MY_BOARDS,
                    ownerId: model.me.userId,
                    title: MAIN_PAGE_TITLE,
                    parentId: undefined
                })
                : this.$scope.$parent['vm'].folders.find((folder: Folder) => folder.id == this.folderId);

            this.initialFolder = !!originalBoards[0].folderId ?
                this.$scope.$parent['vm'].folders.find((folder: Folder) => folder.id == originalBoards[0].folderId)
                : new Folder().build({_id: FOLDER_TYPE.MY_BOARDS, ownerId: model.me.userId, title: MAIN_PAGE_TITLE, parentId: undefined});

            if (ShareUtils.folderOwnerNotShared(this.initialFolder)
                && ShareUtils.folderOwnerNotShared(this.targetFolder)) {
                //initial folder owner, target folder owner
                this.display = false;
                await boardsService.moveBoardsToFolder(this.boardIds, this.folderId);
                this.$scope.$parent['vm'].resetDragAndDrop();
                this.$scope.$parent['vm'].onFormSubmit();
            } else if (myBoards.length != this.boardIds.length) { //not board owner
                this.display = false;
                this.$scope.$parent['vm'].displayMoveNoRightInFolderLightbox = true;
                safeApply(this.$scope.$parent['vm'].$scope);
                return ;
            } else if ((ShareUtils.folderOwnerNotShared(this.initialFolder)
                    || ShareUtils.folderOwnerAndSharedOrShareRights(this.initialFolder))
                && ShareUtils.folderOwnerAndSharedOrShareRights(this.targetFolder)) {
                //initial folder owner/has right, target folder has right OR is owner + shared
                if (this.folderId == FOLDER_TYPE.MY_BOARDS) this.folderId = null;
                this.display = false;
                this.fromMoveLightbox = true;
                this.$scope.$parent['vm'].displayEnterSharedFolderWarningLightbox = true;
                safeApply(this.$scope.$parent['vm'].$scope);

            } else if (ShareUtils.folderOwnerAndSharedOrShareRights(this.initialFolder)
                && ShareUtils.folderOwnerNotShared(this.targetFolder)) {
                //initial folder has right OR is owner + shared, target folder owner
                if (this.folderId == FOLDER_TYPE.MY_BOARDS) this.folderId = null;
                this.display = false;
                this.fromMoveLightbox = true;
                this.$scope.$parent['vm'].displayExitSharedFolderWarningLightbox = true;
                safeApply(this.$scope.$parent['vm'].$scope);
            } else {
                this.display = false;
                this.$scope.$parent['vm'].displayMoveNoRightInFolderLightbox = true;
            }
        } catch (e) {
            throw e;
        }
    }
    

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-move-lightbox/board-move-lightbox.html`,
        scope: {
            display: '=',
            folderTrees: '=',
            boardIds: '=',
            initialFolder:'=',
            targetFolder:'=',
            fromMoveLightbox:'='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardMoveScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardMoveLightbox = ng.directive('boardMoveLightbox', directive)