import {model, ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardForm, Card} from "../../models";
import {create} from 'sortablejs';
import {boardsService} from "../../services";
import {LAYOUT_TYPE} from "../../core/enums/layout-type.enum";

interface IViewModel extends ng.IController, ICardListProps {
    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    openPreview?(card: Card): void;

    openTransfer?(card: Card): void;

    openLock?(card: Card): void;

}

interface ICardListProps {
    cards: Array<Card>;
    selectedCardIds: Array<string>;

    layout: LAYOUT_TYPE;

    isDraggable: boolean;
    isScrollable: boolean;
    selectorResize: string;

    hasCaption: boolean;

    boardRight?: any;
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
    onMove?;
}

interface ICardListScope extends IScope, ICardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    cards: Array<Card>;
    selectedCardIds: Array<string>;
    layout: LAYOUT_TYPE;
    isDraggable: boolean;
    isScrollable: boolean;
    selectorResize: string;


    hasCaption: boolean;

    boardRight: any;
    hasEdit: boolean;
    hasDuplicate: boolean;
    hasHide: boolean;
    hasDelete: boolean;
    hasPreview: boolean;
    hasTransfer: boolean;
    hasLock: boolean;


    constructor(private $scope: ICardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.selectedCardIds = [];
    }

    $onInit = (): void => {
    }

    $onDestroy() {
    }

    isCardSelected = (cardId: string): boolean => {
        let isCardSelected: boolean = false;
        if (!!this.selectedCardIds) {
            isCardSelected = this.selectedCardIds.find((id: string) => id === cardId) !== undefined;
        }
        return isCardSelected;
    }

    selectCard = (cardId: string): void => {
        if (!!this.selectedCardIds) {
            if (!this.isCardSelected(cardId)) {
                this.selectedCardIds.push(cardId);
            } else {
                // deselect card
                this.selectedCardIds = this.selectedCardIds.filter((id: string) => id !== cardId);
            }
        }
    }

    canLock = (card: Card): boolean => {
        return !!this.hasLock && (card.ownerId == model.me.userId && this.boardRight.publish !== undefined) || this.boardRight.manager !== undefined;
    }

    canEdit = (card: Card): boolean => {
        return !!this.hasEdit &&
            (card.ownerId == model.me.userId && this.boardRight.publish !== undefined)
            || this.boardRight.manager !== undefined
            || (this.boardRight.publish && !card.locked);
    }

    canDuplicate = (card: Card): boolean => {
        return !!this.hasEdit &&
            card.ownerId == model.me.userId && this.boardRight.boardRight !== undefined
            || this.boardRight.manager !== undefined
            || (this.boardRight.contrib && !card.locked);
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list.html`,
        scope: {
            cards: '=',
            layout: '=',
            selectedCardIds: '=',
            isDraggable: '=',
            isScrollable: '=',
            hasCaption: '=',
            boardRight: '=',
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
            onMove: '&',
            selectorResize: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            const cardList: Element = document.getElementById("card-list");
            if (cardList && vm.isDraggable) {
                create(cardList, {
                    animation: 150,
                    delay: 150,
                    delayOnTouchOnly: true,
                    onUpdate: async (evt) => {
                        if (vm.isDraggable && vm.cards && vm.cards.length > 0) {
                            vm.cardIds = vm.cards.map((card: Card) => card.id);
                            let movedCardId: string = vm.cardIds[evt.oldIndex];
                            let newCardIndex: number = evt.newIndex;
                            vm.cardIds.splice(evt.oldIndex, 1);
                            vm.cardIds.splice(newCardIndex, 0, movedCardId);
                            let form: BoardForm = new BoardForm();
                            form.cardIds = vm.cardIds;
                            await boardsService.updateBoard(vm.cards[0].boardId, form);
                            $parse($scope.vm.onMove())({});
                        }
                    }
                });
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
        }
    }
}

export const cardList = ng.directive('cardList', directive)