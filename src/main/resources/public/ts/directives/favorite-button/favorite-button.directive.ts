import {ng} from "entcore";
import {RootsConst} from "../../core/constants/roots.const";
import {IParseService, IScope} from "angular";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, IFavoriteButtonProps {
    onFavorite?(): Promise<void>;
}


interface IFavoriteButtonProps {
    element_id: string;
    elementFavNb: number;
    displayFavNb: boolean;
    onFavoriteHandler?;
    hasLiked: boolean;
}

interface IFavoriteButtonScope extends IScope, IFavoriteButtonProps {
    vm: IViewModel;
}


class Controller implements IViewModel {

    element_id: string;
    elementFavNb: number;
    displayFavNb: boolean;
    hasLiked: boolean;

    constructor(private $scope: IFavoriteButtonScope){
    }

    $onInit() {
    }

    $onDestroy() {
    }

}


function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}favorite-button/favorite-button.html`,
        scope: {
            elementId: '=',
            elementFavNb: '=',
            displayFavNb: '=',
            onFavoriteHandler: '&',
            hasLiked: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope','$location','$window','$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFavoriteButtonScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.onFavorite = async (): Promise<void> => {
                let res = await $parse($scope.vm.onFavoriteHandler())(vm.elementId, vm.hasLiked);
                if (res) {
                    vm.hasLiked = !vm.hasLiked;

                    if (vm.hasLiked) {
                        vm.elementFavNb++;
                    } else {
                        vm.elementFavNb--;
                    }
                }
                safeApply($scope);
            }
        }
    }
}
export const favoriteButton = ng.directive('favoriteButton', directive)