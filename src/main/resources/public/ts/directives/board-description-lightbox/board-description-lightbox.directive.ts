import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Boards, Card, IBoardOwner, IBoardPayload, IBoardsParamsRequest} from "../../models";
import {IBoardsService} from "../../services";

interface IViewModel extends ng.IController, IBoardDescriptionProps {
    display(): void;
    closeForm(): void;
}

interface IBoardDescriptionProps {

}

interface IBoardDescriptionScope extends IScope, IBoardDescriptionProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    displayDescription : boolean = false;
    boards: Array<Board>;


    constructor(private $scope: IBoardDescriptionScope) {
    }

    $onInit() {
    }

    display = (): void => {
        this.displayDescription = true;
    }

    closeForm = (): void => {
        this.displayDescription = false;
    }

    $onDestroy() {
    }

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-description-lightbox/board-description-lightbox.html`,
        scope: {
            board: '=',
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDescriptionScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

        }
    }
}

export const boardDescriptionLightbox = ng.directive('boardDescriptionLightbox', directive)