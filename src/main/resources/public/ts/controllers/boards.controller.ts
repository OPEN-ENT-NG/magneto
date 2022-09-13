import {ng} from "entcore";
import {IScope} from "angular";
import {IBoardsService} from "../services";

interface IViewModel {

}

interface IBoardsScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {

    constructor(private $scope: IBoardsScope,
                private $route: any,
                private boardsService: IBoardsService) {
        this.$scope.vm = this;
    }

    $onInit() {

    }

    $onDestroy() {
    }
}

export const boardsController = ng.controller('BoardsController',
    ['$scope', 'route', 'BoardsService', Controller]);