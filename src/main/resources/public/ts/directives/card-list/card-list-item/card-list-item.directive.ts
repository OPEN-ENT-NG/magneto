import {angular, model, ng} from "entcore";
import {IAugmentedJQuery, ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../../core/constants/roots.const";
import {Card, IBoardOwner} from "../../../models";
import {DateUtils} from "../../../utils/date.utils";
import {RESOURCE_TYPE} from "../../../core/enums/resource-type.enum";
import {safeApply} from "../../../utils/safe-apply.utils";
import {Subject} from "rxjs";
import {cardsService} from "../../../services";

interface IViewModel extends ng.IController, ICardListItemProps {
    formatDate(date: string): string;

    formatDateModification(date: string): string;

    hasOptions(): boolean;

    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    openPreview?(card: Card): void;

    openTransfer?(card: Card): void;

    openLock?(card: Card): void;

    openBoardView?(card: Card): void;

    openCardOptions?(): Promise<void>;

    onCardFavorite?(card_id: string, isFavorite: boolean): void;

    getZoomLevel(): number;

    isDisplayedOptions: boolean;
    isSelected: boolean;
}

interface ICardListItemProps {
    card: Card;

    isSortable: boolean;
    hasCaption: boolean;
    selectorResize: string;

    hasEdit: boolean;
    onEdit?;
    hasDuplicate: boolean;
    onDuplicate?;
    hasHide: boolean;
    onHide?;
    hasDelete: boolean;
    onDelete?;
    hasPreview: boolean;
    onPreview?;
    hasTransfer: boolean;
    onTransfer?;
    hasLock: boolean;
    onLock?;
    hasBoardView: boolean;
    onBoardView?;
    hasFavorite: boolean;
    cardUpdateEventer: Subject<void>;
    hasComments: boolean;
    boardOwner: IBoardOwner;
    hasDisplayFavNumber: boolean;
    zoom:number;
}

interface ICardListItemScope extends IScope, ICardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    isDisplayedOptions: boolean;
    isSortable: boolean;

    hasCaption: boolean;

    hasEdit: boolean;
    hasDuplicate: boolean;
    hasHide: boolean;
    hasDelete: boolean;
    hasPreview: boolean;
    hasTransfer: boolean;
    hasLock: boolean;
    hasBoardView: boolean;
    hasFavorite: boolean;
    hasComments: boolean;

    selectorResize: string;
    isSelected: boolean;
    RESOURCE_TYPES: typeof RESOURCE_TYPE;
    cardUpdateEventer: Subject<void>;
    boardOwner: IBoardOwner;
    hasDisplayFavNumber: boolean;
    zoom:number;

    constructor(private $scope: ICardListItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
        this.isDisplayedOptions = false;
        this.isSelected = false;
    }

    $onInit() {
    }

    $onDestroy() {
    }

    formatDateModification = (date: string): string => {
        return DateUtils.createdSince(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR"])
    }

    formatDate = (date: string): string => {
        return DateUtils.format(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR-HOUR-MIN-SEC"])
    }


    getLastUserId = (card: Card): string => {
        return !!card.lastModifierId ? card.lastModifierId : card.ownerId;
    }

    getLastUserName = (card: Card): string => {
        return !!card.lastModifierName ? card.lastModifierName : card.ownerName;
    }

    hasOptions = (): boolean => {
        return this.hasDelete || this.hasPreview || this.hasEdit || this.hasHide || this.hasDuplicate;
    }

    getZoomLevel(): number {
        if(this.zoom >= 100){
            return (this.zoom - 100 )/15 + 3;
        }
        else {
            return (this.zoom - 55   ) / 15
        }

    }
    hasImgDisplay(): boolean{
        return this.zoom >= 85;
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item/card-list-item.html`,
        scope: {
            card: '=',
            isSelected: '=',
            isSortable: '=',
            hasCaption: '=',
            hasEdit: '=',
            onEdit: '&',
            hasDuplicate: '=',
            onDuplicate: '&',
            hasHide: '=',
            onHide: '&',
            hasDelete: '=',
            onDelete: '&',
            hasPreview: '=',
            onPreview: '&',
            hasTransfer: '=',
            onTransfer: '&',
            hasLock: '=',
            onLock: '&',
            hasBoardView: '=',
            onBoardView: '&',
            hasFavorite: '=',
            selectorResize: '=',
            cardUpdateEventer: '=',
            hasComments: '=',
            boardOwner: '=',
            hasDisplayFavNumber: '=',
            zoom: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            $(document).bind('click', (event: JQueryEventObject): void => {
                if(!element.find(event.target).length && vm.isDisplayedOptions) {
                    vm.isDisplayedOptions = false;
                }
                safeApply($scope);
            });

            let repositionActionOptions = (): void => {
                let windowElem: JQuery = vm.selectorResize ? $(vm.selectorResize): $(window);
                let actionOptionsElem: JQuery =
                    $("#options-" + vm.card.id);
                let repositionClass: string = 'reposition';
                // if element position element is left sided, we want to check right sided position to see if it goes
                // out of the screen, so we add 2 times the element width.
                if(actionOptionsElem.length > 0) {
                    let actionOptionX: number =
                        actionOptionsElem.offset().left +
                        (actionOptionsElem.width() * (actionOptionsElem.hasClass(repositionClass) ? 2 : 1));

                    if (actionOptionX >= windowElem.width() && !actionOptionsElem.hasClass(repositionClass))
                        actionOptionsElem.addClass(repositionClass);
                    else if (actionOptionX < windowElem.width() && actionOptionsElem.hasClass(repositionClass))
                        actionOptionsElem.removeClass(repositionClass)
                }
            }

            angular.element(window).bind('resize', async (): Promise<void> => {
                await safeApply($scope); // waiting dom recalculate
                repositionActionOptions();
            });

            vm.openCardOptions = async (): Promise<void> => {
                vm.isDisplayedOptions = !vm.isDisplayedOptions;
                await safeApply($scope);
                if (vm.isDisplayedOptions) repositionActionOptions();
            }

            vm.openEdit = (card: Card): void => {
                $parse($scope.vm.onEdit())(card);
            }

            vm.openDuplicate = (card: Card): void => {
                $parse($scope.vm.onDuplicate())(card);
            }

            vm.openHide = (card: Card): void => {
                $parse($scope.vm.onHide())(card);
            }

            vm.openDelete = (card: Card): void => {
                $parse($scope.vm.onDelete())(card);
            }

            vm.openPreview = (card: Card): void => {
                $parse($scope.vm.onPreview())(card);
            }

            vm.openTransfer = (card: Card): void => {
                $parse($scope.vm.onTransfer())(card);
            }

            vm.openLock = (card: Card): void => {
                $parse($scope.vm.onLock())(card);
            }

            vm.openBoardView = (card: Card): void => {
                $parse($scope.vm.onBoardView())(card);
            }

            vm.onCardFavorite = async (card_id: string, isFavorite: boolean): Promise<boolean> => {
                return await cardsService.favoriteCard(card_id, isFavorite);
            }
        }
    }
}

export const cardListItem = ng.directive('cardListItem', directive)
