import {ng} from "entcore";
import {IScope} from "angular";
import {ICardsService} from "../services";

interface IViewModel {

}

interface IBoardViewScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {

    constructor(private $scope: IBoardViewScope,
                private $route: any,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
    }

    $onInit() {

    }

    $onDestroy() {
    }
}

export const boardViewController = ng.controller('BoardViewController',
    ['$scope', 'route', 'CardsService', Controller]);