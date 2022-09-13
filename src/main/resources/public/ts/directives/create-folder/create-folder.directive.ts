import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel {
}

interface ICreateFolderProps {

}

interface ICreateFolderScope extends IScope {
    vm: ICreateFolderProps;
}

class Controller implements ng.IController, IViewModel {

    constructor(private $scope: ICreateFolderScope,
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
        templateUrl: `${RootsConst.directive}/create-folder/create-folder.html`,
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

export const createFolder = ng.directive('createFolder', directive)