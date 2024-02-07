import {model, ng} from "entcore";
import {
    IAugmentedJQuery,
    ICompileService,
    IParseService,
    IScope,
} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardsFilter} from "../../models/boards-filter.model";
import {ShareUtils} from "../../utils/share.utils";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";

interface IViewModel extends ng.IController, IBoardContainerHeaderProps {
    hasRight?(right: string): boolean;
    openCreateForm?(): void;
    hasFolderCreationRight?(): boolean;
}

interface IBoardContainerHeaderProps {
    filter?: BoardsFilter;
    magnetoStandalone?: boolean;

    onHasRight?;
    onOpenCreateForm?;
}

interface IBoardContainerHeaderScope extends IScope, IBoardContainerHeaderProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    filter: BoardsFilter;
    magnetoStandalone: boolean;

    constructor(private $scope: IBoardContainerHeaderScope,
                private $parse: IParseService,
                private $element: IAugmentedJQuery,
                private $compile: ICompileService) {
    }

    $onInit() {
    }

    openCreateForm = (): void => {
        this.$scope.vm.onOpenCreateForm();
    };

    hasFolderCreationRight = (): boolean => { // main page || folder owner || has folder share rights
        return ShareUtils.hasFolderCreationRight(this.$scope.$parent['vm'].openedFolder);
    }


    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-container-header/board-container-header.html`,
        controllerAs: 'vm',
        scope: {
            filter: '=',
            magnetoStandalone: '=',
            onHasRight: '&',
            onOpenCreateForm: '&'
        },

        bindToController: true,
        controller: ['$scope', '$parse', '$element', '$compile', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardContainerHeaderScope,
                        vm: IViewModel) {

            $scope.vm.hasRight = (right: string): boolean => {
                return $parse($scope.vm.onHasRight())(right);
            };
        }
    }
}

export const boardContainerHeader = ng.directive('boardContainerHeader', directive)