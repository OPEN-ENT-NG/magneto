import {angular, model, ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Folder, FolderTreeNavItem} from "../../models";
import {boardsService} from "../../services";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, IBoardMoveProps {
    folderId: string;

    selectFolder(folder: FolderTreeNavItem): void;
    submit?(): Promise<void>;
    isFormValid(): boolean;
    closeForm(): void;
}

interface IBoardMoveProps {
    display: boolean;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    onSubmit?;
}

interface IBoardMoveScope extends IScope, IBoardMoveProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    folders: Array<Folder>;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    folderId: string;
    onSubmit: () => void;


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

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-move-lightbox/board-move-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            folderTrees: '=',
            boardIds: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardMoveScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submit = async (): Promise<void> => {
                try {

                    let originalBoards: Board[] = [];
                    vm.boardIds.filter((boardId: string) =>
                        $scope.$parent['vm'].boards.map((board: Board) => {
                            if (boardId == board.id && board.owner.userId == model.me.userId) originalBoards.push(board)}));
                    $scope.$parent['vm'].dragAndDropTarget = $scope.$parent['vm'].folders.find((folder: Folder) => folder.id == vm.folderId);

                    if (originalBoards.length != vm.boardIds.length) { //not board owner
                        vm.display = false;
                        $scope.$parent['vm'].displayMoveNoRightInFolderLightbox = true;
                        safeApply($scope.$parent['vm'].$scope);
                        return ;
                    }

                    $scope.$parent['vm'].dragAndDropInitialFolder = !!originalBoards[0].folderId ?
                        $scope.$parent['vm'].folders.find((folder: Folder) => folder.id == originalBoards[0].folderId)
                        : new Folder();

                    if (($scope.$parent['vm'].dragAndDropInitialFolder.ownerId == model.me.userId
                            || vm.$scope.$parent['vm'].dragAndDropInitialFolder.id == undefined
                            || $scope.$parent['vm'].folderHasShareRight($scope.$parent['vm'].dragAndDropInitialFolder, "publish"))
                        && ($scope.$parent['vm'].folderHasShareRight($scope.$parent['vm'].dragAndDropTarget, "publish")
                            || ($scope.$parent['vm'].dragAndDropTarget.ownerId == model.me.userId && !!$scope.$parent['vm'].dragAndDropTarget.shared))) {
                        //initial folder owner/has right, target folder has right OR is owner + shared
                        if (vm.folderId == FOLDER_TYPE.MY_BOARDS) vm.folderId = null;
                        vm.display = false;
                        $scope.$parent['vm'].isFromMoveBoardLightbox = true;
                        $scope.$parent['vm'].displayEnterSharedFolderWarningLightbox = true;
                        safeApply($scope.$parent['vm'].$scope);

                    } else if (($scope.$parent['vm'].folderHasShareRight($scope.$parent['vm'].dragAndDropInitialFolder, "publish")
                            || ($scope.$parent['vm'].dragAndDropInitialFolder.ownerId == model.me.userId && !!$scope.$parent['vm'].dragAndDropInitialFolder.shared))
                        && ($scope.$parent['vm'].dragAndDropTarget.ownerId == model.me.userId || vm.folderId == FOLDER_TYPE.MY_BOARDS)) {
                        //initial folder has right OR is owner + shared, target folder owner
                        if (vm.folderId == FOLDER_TYPE.MY_BOARDS) vm.folderId = null;
                        vm.display = false;
                        $scope.$parent['vm'].isFromMoveBoardLightbox = true;
                        $scope.$parent['vm'].displayExitSharedFolderWarningLightbox = true;
                        safeApply($scope.$parent['vm'].$scope);

                    } else if (($scope.$parent['vm'].dragAndDropInitialFolder.ownerId == model.me.userId
                            || $scope.$parent['vm'].dragAndDropInitialFolder.id == undefined)
                        && ($scope.$parent['vm'].dragAndDropTarget.ownerId == model.me.userId || $scope.$parent['vm'].dragAndDropTarget.ownerId == model.me.userId)) { //initial folder owner, target folder owner
                        if (vm.folderId == FOLDER_TYPE.MY_BOARDS) vm.folderId = null;
                        vm.display = false;
                        await boardsService.moveBoardsToFolder(vm.boardIds, vm.folderId);

                    } else {
                        vm.display = false;
                        $scope.$parent['vm'].displayMoveNoRightInFolderLightbox = true;
                    }
                } catch (e) {
                    throw e;
                }

                $parse($scope.vm.onSubmit())({});
                vm.closeForm();
            };
        }
    }
}

export const boardMoveLightbox = ng.directive('boardMoveLightbox', directive)