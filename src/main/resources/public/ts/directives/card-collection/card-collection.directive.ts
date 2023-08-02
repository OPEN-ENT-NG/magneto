import {_, ng, notify, toasts} from "entcore";
import {ILocationService, IParseService, IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Card, CardCollection, Cards, ICardsBoardParamsRequest, ICardsParamsRequest} from "../../models";
import {safeApply} from "../../utils/safe-apply.utils";
import {AxiosError, AxiosResponse} from "axios";
import {boardsService, cardsService} from "../../services";
import {CardsFilter} from "../../models/cards-filter.model";
import {Object} from "core-js";
import {InfiniteScrollService} from "../../shared/services";
import {COLLECTION_NAVBAR_VIEWS} from "../../core/enums/collection-navbar.enum";
import {RESOURCE_ORDER} from "../../core/enums/resource-order.enum";

interface IViewModel extends ng.IController, ICardCollectionProps {
    closeForm(): void;

    resetCards(): Promise<void>;

    getCards(): Promise<void>;

    getCardsByBoardId(boardId: string): Promise<void>;

    getCardsByBoard(): Promise<void>;

    hideCardsByBoardId(boardId: string): void;

    submitDuplicateCard?(card?: Card): Promise<void>;

    submitDuplicateBoard?(boardId: string): Promise<void>;

    onSearchCard(searchText: string): Promise<void>;

    getDisplayedCollectionCards(cards?: Array<Card>): void;

    openPreview(card: Card): void;

    goToBoard(card: Card): void;


    changeView(): void;

    changeOrder(field: string): Promise<void>;

    changeNav(navbarView: COLLECTION_NAVBAR_VIEWS): Promise<void>;

    isFormValid(): boolean;

    onScroll(): Promise<void>;

    cards: Array<Card>;
    displayedCard: Array<CardCollection>;

    displayBoard: boolean;
    orderFavorite: boolean;
    displayPreview: boolean;
    displayScroll: boolean;

    selectedCardIds: Array<string>;
    selectedCard: Card;

    filter: CardsFilter;
    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;
    isLoading: boolean;

    infiniteScrollService: InfiniteScrollService;


}

interface ICardCollectionProps {
    display: boolean;
    isHome: boolean;
    board: Board;
    navbarFirstSelected: COLLECTION_NAVBAR_VIEWS;
    navbar: Array<COLLECTION_NAVBAR_VIEWS>
    onSubmit?;

}

interface ICardCollectionScope extends IScope, ICardCollectionProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    cards: Array<Card>;
    navbar: Array<COLLECTION_NAVBAR_VIEWS>;
    displayedCard: Array<CardCollection>;
    selectedCardIds: Array<string>;
    selectedCard: Card;

    isHome: boolean;
    display: boolean;
    displayBoard: boolean;
    orderFavorite: boolean;
    displayPreview: boolean;
    displayScroll: boolean;

    filter: CardsFilter;

    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;
    navbarFirstSelected: COLLECTION_NAVBAR_VIEWS;
    RESOURCE_ORDERS: typeof RESOURCE_ORDER;
    isLoading: boolean;

    infiniteScrollService: InfiniteScrollService;


    constructor(private $scope: ICardCollectionScope) {
        this.cards = [];
        this.displayedCard = [];
        this.selectedCardIds = [];
        this.selectedCard = new Card();
        this.displayBoard = false;
        this.orderFavorite = false;
        this.displayPreview = false;
        this.isLoading = true;
        this.filter = new CardsFilter();
        this.infiniteScrollService = new InfiniteScrollService;
        this.RESOURCE_ORDERS = RESOURCE_ORDER;
    }

    async $onInit() {
        this.navbarViewSelected = this.navbarFirstSelected as COLLECTION_NAVBAR_VIEWS;
        this.getFilters();
        await this.getCards();
    }

    closeForm = (): void => {
        this.display = false;
    }

    $onDestroy() {
    }

    isFormValid = (): boolean => {
        return this.selectedCardIds && this.selectedCardIds.length > 0;
    }

    /**
     * On scroll callback:
     * - load more boards if scroll is at the bottom of the page
     */
    onScroll = async (): Promise<void> => {
        if (this.cards && this.cards.length > 0) {
            this.filter.nextPage();
            await this.getCards();
        }
    }

    changeView = (): void => {
        if (this.displayBoard) {
            this.getDisplayedCollectionCards();
        } else {
            this.displayedCard = [];
        }
        safeApply(this.$scope);
    }

    changeOrder = async (field: string): Promise<void> => {
        switch (field) {
            case this.RESOURCE_ORDERS.FAVORITE:
                if (this.orderFavorite) {
                    this.filter.sortBy = field;
                    await this.resetCards();
                } else {
                    this.filter.sortBy = "";
                    await this.resetCards();
                }
                break;
            default:
                break;
        }
        safeApply(this.$scope);
    }


    getDisplayedCollectionCards = (cards?: Array<Card>): void => {
        let boards: CardCollection[];
        boards = Object.entries(_.groupBy(cards || this.cards, 'boardId')).map(board => {
            return board.length > 1 ? new CardCollection(board[0], board[1]) : null;
        });

        boards.forEach((collection: CardCollection) => {
            if (this.displayedCard.length > 0) {
                if (_.last(this.displayedCard).boardId == collection.boardId) {
                    _.last(this.displayedCard).cards = _.last(this.displayedCard).cards.concat(collection.cards)
                } else {
                    this.displayedCard.push(collection);
                }
            } else {
                this.displayedCard.push(collection);
            }
        })
        safeApply(this.$scope);
    }

    getCardsByBoardId = async (boardId: string): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            boardId: boardId
        };
        cardsService.getAllCardsByBoard(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    let ids: Set<string> = new Set(this.findCardCollection(boardId).cards.map((card: Card) => card.id));
                    this.findCardCollection(boardId).cards = [...this.findCardCollection(boardId).cards, ...res.all.filter(card => !ids.has(card.id))];
                    this.findCardCollection(boardId).isLinkedCardsDisplay = true;
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    hideCardsByBoardId = (boardId: string): void => {
        this.findCardCollection(boardId).cards = this.cards.filter(card => card.boardId == boardId);
        this.findCardCollection(boardId).isLinkedCardsDisplay = false;
        safeApply(this.$scope);
    }

    private findCardCollection = (boardId: string): CardCollection => {
        return this.displayedCard.find(collection => {
            return collection.boardId == boardId;
        })
    }

    private isCurrentViewNav = (view: COLLECTION_NAVBAR_VIEWS): boolean => {
        return this.navbarViewSelected === view;
    }

    changeNav = async (navbarView: COLLECTION_NAVBAR_VIEWS): Promise<void> => {
        this.navbarViewSelected = navbarView;
        this.getFilters();
        await this.resetCards();
        safeApply(this.$scope);
    }

    private getFilters = (): void => {
        this.filter.isShared = this.isCurrentViewNav(COLLECTION_NAVBAR_VIEWS.SHARED_CARDS);
        this.filter.isPublic = this.isCurrentViewNav(COLLECTION_NAVBAR_VIEWS.PUBLIC_CARDS);
        this.filter.isFavorite = this.isCurrentViewNav(COLLECTION_NAVBAR_VIEWS.FAVORITES);
    }

    getCards = async (): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            page: this.filter.page,
            sortBy: this.filter.sortBy,
            searchText: this.filter.searchText,
            boardId: !!this.board ? this.board.id : null,
            isShared: this.filter.isShared,
            isPublic: this.filter.isPublic,
            isFavorite: this.filter.isFavorite
        };
        cardsService.getAllCardsCollection(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    this.cards.push(...res.all);
                    if (this.displayBoard) {
                        this.getDisplayedCollectionCards(res.all);
                    }
                    this.infiniteScrollService.updateScroll();
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    /**
     * Callback on card search.
     */
    onSearchCard = async (): Promise<void> => {
        await this.resetCards();
        safeApply(this.$scope);
    }

    resetCards = async (): Promise<void> => {
        this.filter.page = 0;
        this.cards = [];
        this.selectedCardIds = [];
        this.displayedCard = [];
        await this.getCards();
    }

    getCardsByBoard = async (): Promise<void> => {
        await this.getCards();
    }

    openPreview = (card: Card): void => {
        this.selectedCard = card;
        this.displayPreview = true;
    }

    goToBoard = (card: Card): void => {
        window.location.href = `/magneto#/board/view/${card.boardId}`;
        window.location.reload()
    }
}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-collection/card-collection.html`,
        scope: {
            display: '=',
            board: '=?',
            navbar: '=',
            navbarFirstSelected: '=',
            isHome: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardCollectionScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            vm.submitDuplicateCard = async (card?: Card): Promise<void> => {
                try {
                    const params: ICardsBoardParamsRequest = {
                        boardId: vm.board.id,
                        cardIds: card ? [card.id] : vm.selectedCardIds
                    };
                    await cardsService.duplicateCard(params)
                        .then(async (response: AxiosResponse) => {
                            if (response.status === 200 || response.status === 201) {
                                toasts.confirm('magneto.duplicate.cards.confirm');
                                $parse($scope.vm.onSubmit())({});
                                await vm.resetCards();
                                vm.closeForm();
                            }
                        })
                } catch (e) {
                    toasts.warning('magneto.duplicate.cards.error');
                    console.error(e);
                }
            }

            vm.submitDuplicateBoard = async (boardId: string): Promise<void> => {
                try {
                    await boardsService.duplicateBoard(boardId)
                        .then(async (response: AxiosResponse) => {
                            if (response.status === 200 || response.status === 201) {
                                toasts.confirm('magneto.duplicate.elements.confirm');
                            }
                        })
                } catch (e) {
                    toasts.warning('magneto.duplicate.elements.error');
                    console.error(e);
                }
            }
        }
    }
}

export const cardCollection = ng.directive('cardCollection', directive)