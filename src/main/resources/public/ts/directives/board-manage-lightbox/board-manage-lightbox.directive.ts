import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel {
}

interface IBoardManageProps {

}

interface IBoardManageScope extends IScope {
    vm: IBoardManageProps;
}

class Controller implements ng.IController, IViewModel {

    constructor(private $scope: IBoardManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-manage-lightbox/board-manage-lightbox.html`,
        scope: {
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function (scope: ng.IScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {
        }
    }
}

export const boardManageLightbox = ng.directive('boardManageLightbox', directive)