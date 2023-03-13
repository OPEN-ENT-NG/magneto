import {angular, model, ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardForm, Card, IBoardOwner} from "../../models";
import {create} from 'sortablejs';
import {boardsService} from "../../services";
import {LAYOUT_TYPE} from "../../core/enums/layout-type.enum";
import {Subject} from "rxjs";

interface IViewModel extends ng.IController, ICardListProps {

    resizeAllCardItems?(): void;

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

    isSortable: boolean;
    isDraggable: boolean;
    isScrollable: boolean;
    selectorResize: string;
    selectorIdentifier: string;

    cardUpdateEventer: Subject<void>;


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

    onLoaded?;

    hasComments: boolean;
    simpleView: boolean;
    boardOwner: IBoardOwner;
}

interface ICardListScope extends IScope, ICardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    cards: Array<Card>;
    selectedCardIds: Array<string>;
    layout: LAYOUT_TYPE;
    isSortable: boolean;
    isDraggable: boolean;
    isScrollable: boolean;
    selectorResize: string;
    selectorIdentifier: string;
    cardUpdateEventer: Subject<void>;


    hasCaption: boolean;

    boardRight: any;
    hasEdit: boolean;
    hasDuplicate: boolean;
    hasHide: boolean;
    hasDelete: boolean;
    hasPreview: boolean;
    hasTransfer: boolean;
    hasLock: boolean;
    hasComments: boolean;
    simpleView: boolean;
    boardOwner: IBoardOwner;


    constructor(private $scope: ICardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.selectedCardIds = [];
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
        return !!this.hasLock && (card.ownerId == model.me.userId || this.boardRight.manager !== undefined);
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

function directive($parse: IParseService, $timeout: ng.ITimeoutService): ng.IDirective {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list.html`,
        scope: {
            cards: '=',
            layout: '=',
            selectedCardIds: '=',
            isSortable: '=',
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
            onLoaded: '&',
            selectorResize: '=',
            selectorIdentifier: '=',
            cardUpdateEventer: '=',
            hasComments: '=',
            simpleView: '=',
            boardOwner: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', '$timeout', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            $(document).ready(() => {

                if (vm.cardUpdateEventer) {
                    vm.cardUpdateEventer.asObservable().subscribe(() => {
                        $timeout(() => {
                            vm.resizeAllCardItems();
                        }, 200);
                    });
                }

                if (vm.layout == LAYOUT_TYPE.FREE) {
                    const cardList: Element = document.getElementById("card-list");
                    if (cardList && vm.isSortable) {
                        create(cardList, {
                            animation: 150,
                            delay: 150,
                            forceAutoScrollFallback: true,
                            scroll: true, // or HTMLElement
                            scrollSensitivity: 100, // px, how near the mouse must be to an edge to start scrolling.
                            scrollSpeed: 30, // px*/
                            delayOnTouchOnly: true,
                            onStart: () => {
                                vm.isDraggable = false;
                                $scope.$apply();
                            },
                            onUpdate: async (evt) => {
                                if (vm.isSortable && vm.cards && vm.cards.length > 0) {
                                    vm.cardIds = vm.cards.map((card: Card) => card.id);
                                    let movedCardId: string = vm.cardIds[evt.oldIndex];
                                    let newCardIndex: number = evt.newIndex;
                                    vm.cardIds.splice(evt.oldIndex, 1);
                                    vm.cardIds.splice(newCardIndex, 0, movedCardId);
                                    let form: BoardForm = new BoardForm();
                                    form.cardIds = vm.cardIds;
                                    vm.cards = vm.cards.sort(function(a, b) {
                                        return vm.cardIds.indexOf(a.id) - vm.cardIds.indexOf(b.id);
                                    });
                                    await boardsService.updateBoard(vm.cards[0].boardId, form);
                                    vm.isDraggable = true;
                                    $scope.$apply();
                                }
                            }
                        });

                    }
                }
            })


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


            if (!vm.simpleView) {
                $timeout(() => {
                    vm.resizeAllCardItems();
                }, 800);

                $(document).ready(() => {
                    $parse($scope.vm.onLoaded())({});
                });

                angular.element(window).bind('resize', async (): Promise<void> => {
                    window.addEventListener('resize', vm.resizeAllCardItems);
                });
            }



            vm.resizeAllCardItems = (): void => {
                let allItems:  HTMLCollectionOf<Element> = document.getElementsByClassName('card-list-content');
                for (let i = 0; i < allItems.length; i++) {
                    resizeCardItem(allItems[i]);
                }
            }

            let resizeCardItem = (item: any): void => {

                let grid: Element = document.getElementsByClassName('card-list')[0];
                let rowGap: number = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
                let rowHeight: number = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

                let rowSpan: number = Math.ceil((item.querySelector('.card-list-item').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));

                item.style.gridRowEnd = 'span '+ rowSpan;
            }

            vm.resizeAllCardItems();
        }
    }
}

export const cardList = ng.directive('cardList', directive)
