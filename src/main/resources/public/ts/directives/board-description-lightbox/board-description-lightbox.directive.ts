import {angular, ng} from "entcore";
import {IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board} from "../../models";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, IBoardDescriptionProps {
    updateSetVisible(value: boolean): void;
    display(): void;
    closeForm(): void;
    checkDescriptionSize(): void;
}

interface IBoardDescriptionProps {
    showReadMoreLink: boolean;
}

interface IBoardDescriptionScope extends IScope, IBoardDescriptionProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    displayDescription : boolean;
    showReadMoreLink: boolean;
    boards: Array<Board>;


    constructor(private $scope: IBoardDescriptionScope) {
    }

    $onInit() {
        this.displayDescription = false;
        safeApply(this.$scope);
    }

    updateSetVisible = (value: boolean): void => {
        this.showReadMoreLink = value;
        safeApply(this.$scope);
    }

    display = (): void => {
        this.displayDescription = true;
    }

    closeForm = (): void => {
        this.displayDescription = false;
    }

    checkDescriptionSize = (): void => {
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
            showReadMoreLink: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDescriptionScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            const descriptionHeightLimit : number = 64;
            const descriptionHeightLimitMobile : number = 28;

            $(document).ready($scope.vm.checkDescriptionSize);
            $scope.vm.checkDescriptionSize = (): void => {
                if ($("#description-mobile").length > 0) {
                    let descriptionElement : HTMLElement = angular.element('.board-container-header-mobile-description');
                    let spanElement = descriptionElement[0].querySelector('span');
                    let spanHeight = spanElement.offsetHeight;
                    vm.updateSetVisible(spanHeight >= descriptionHeightLimitMobile);
                }
                if ($("#description").length > 0){
                    let descriptionElement : HTMLElement = angular.element('.board-container-header-description');
                    let spanElement = descriptionElement[0].querySelector('span');
                    let spanHeight = spanElement.offsetHeight;
                    vm.updateSetVisible(spanHeight >= descriptionHeightLimit);
                }
            }

            $scope.$watch('vm.board.description', () => {
                $scope.vm.checkDescriptionSize();
            });
        }
    }
}

export const boardDescriptionLightbox = ng.directive('boardDescriptionLightbox', directive)