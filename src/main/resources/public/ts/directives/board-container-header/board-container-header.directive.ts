import {angular, ng} from "entcore";
import {
    IAugmentedJQuery,
    ICompileService,
    IParseService,
    IScope,
} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardsFilter} from "../../models/boards-filter.model";

interface IViewModel extends ng.IController, IBoardContainerHeaderProps {
    hasRight?(right: string): boolean;
    openCreateForm?(): void;
    insert?(): void;
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