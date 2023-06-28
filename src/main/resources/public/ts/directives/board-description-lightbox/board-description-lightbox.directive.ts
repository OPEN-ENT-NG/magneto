import {angular, ng} from "entcore";
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
    checkDescriptionSize: () => void;
    vm: IViewModel;
}

class Controller implements IViewModel {

    displayDescription : boolean = false;
    showReadMoreLink: boolean = false;
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

            $scope.checkDescriptionSize = (): void => {
                let descriptionElement = angular.element('.board-container-header-description-text');
                let descriptionHeight = descriptionElement[0].offsetHeight;
                this.showReadMoreLink = descriptionHeight > 64;
            }
            $scope.$watch('vm.board.description', () => {
                $scope.checkDescriptionSize();
            });
        }
    }
}

export const boardDescriptionLightbox = ng.directive('boardDescriptionLightbox', directive)