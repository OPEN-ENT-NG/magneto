import {ng, template} from 'entcore';
import {IScope, IWindowService} from "angular";

declare let window: any;

interface IViewModel extends ng.IController {
}

interface IMainScope extends IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {

    private eventBus: any;

    constructor(private $scope: IMainScope,
                private $route: any,
                private $window: IWindowService) {
        this.$scope.vm = this;
    }

    $onInit() {

        this.$route({
            boards: () => {
                template.open('main', `boards`);
            },
            board: () => {
                template.open('main', `board`);
            },
            boardRead: () => {
                template.open('main', `board-read`);
            }
        });

    }

    $onDestroy() {
    }

}

export const mainController = ng.controller('MainController',
    ['$scope', 'route', '$window', Controller]);
