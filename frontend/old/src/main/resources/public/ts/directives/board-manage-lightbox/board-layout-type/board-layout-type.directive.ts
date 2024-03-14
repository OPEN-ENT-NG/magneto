import {ng} from "entcore";
import {IScope} from "angular";
import {RootsConst} from "../../../core/constants/roots.const";
import {LAYOUT_TYPE} from "../../../core/enums/layout-type.enum";
import {Board} from "../../../models";


interface IViewModel extends ng.IController, IBoardLayoutTypeProps {
}

interface IBoardLayoutTypeProps {
    board: Board;
}

interface IBoardLayoutTypeScope extends IScope, IBoardLayoutTypeProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    LAYOUT_TYPES: typeof LAYOUT_TYPE;
    board: Board;

    constructor(private $scope: IBoardLayoutTypeScope) {
        this.LAYOUT_TYPES = LAYOUT_TYPE;
    }

    async $onInit() {
    }

    $onDestroy() {
    }


}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-manage-lightbox/board-layout-type/board-layout-type.html`,
        scope: {
            board: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardLayoutTypeScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardLayoutType = ng.directive('boardLayoutType', directive)
