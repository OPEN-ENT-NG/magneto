import {angular, ng} from "entcore";
import {
    IAugmentedJQuery,
    ICompileService,
    IParseService,
    IScope,
} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardsFilter} from "../../models/boards-filter.model";

interface IViewModel extends ng.IController, IBoardContainerHeaderTitleProps {
    hasRight?(right: string): boolean;
    openCreateForm?(): void;
    insert?(): void;
    translate?(key: string): string;
}

interface IBoardContainerHeaderTitleProps {
    filter?: BoardsFilter;
    magnetoStandalone?: boolean;

    onHasRight?;
    onOpenCreateForm?;
}

interface IBoardContainerHeaderTitleScope extends IScope, IBoardContainerHeaderTitleProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    filter: BoardsFilter;
    magnetoStandalone: boolean;

    constructor(private $scope: IBoardContainerHeaderTitleScope,
                private $parse: IParseService,
                private $element: IAugmentedJQuery,
                private $compile: ICompileService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-container-header-title/board-container-header-title.html`,
        controllerAs: 'vm',
        scope: {
            magnetoStandalone: '='
        },

        bindToController: true,
        controller: ['$scope', '$parse', '$element', '$compile', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardContainerHeaderTitleScope,
                        vm: IViewModel) {
        }
    }
}

export const boardContainerHeaderTitle = ng.directive('boardContainerHeaderTitle', directive)