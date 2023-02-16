import {ng, idiom as lang} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board} from "../../models";
import {DateUtils} from "../../utils/date.utils";
import {LAYOUT_TYPE} from "../../core/enums/layout-type.enum";

interface IViewModel extends ng.IController, IBoardListItemProps {
    formatDate(date: string): string;
    getNbCards(): number;
    getSharedOwner(): string;
}

interface IBoardListItemProps {
    board: Board;
    isSelected: boolean;
}

interface IBoardListItemScope extends IScope, IBoardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    isSelected: boolean;

    constructor(private $scope: IBoardListItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

    getSharedOwner = (): string => {
        return lang.translate("magneto.board.owner") + " : " + this.board.owner.displayName;
    }

    formatDate = (date: string): string => {
        return DateUtils.format(date, DateUtils.FORMAT["DAY-MONTH-YEAR-LETTER"])
    }

    getNbCards = (): number => {
        return this.board.layoutType == LAYOUT_TYPE.FREE ? this.board.nbCards : this.board.nbCardsSections;
    }

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-list/board-list-item.html`,
        scope: {
            board: '=',
            isSelected: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardListItem = ng.directive('boardListItem', directive)