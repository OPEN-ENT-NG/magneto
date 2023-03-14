import {ng, notify} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {CardComment, CardComments} from "../../models/card-comment.model";
import {commentsService} from "../../services";
import {safeApply} from "../../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../../shared/services";
import {Subject} from "rxjs";
import {IBoardOwner} from "../../models";

interface IViewModel extends ng.IController, ICommentsPanelProps {
    comments: CardComment[];
    nbOfComments: number;

    isOpened: boolean;
    filter: {
        page: number;
    }

    infiniteScrollService: InfiniteScrollService;

    getComments(): Promise<void>;
    onCommentSubmit(comment: CardComment): void;
    onCommentDelete(commentId: string): void;
    togglePanel(): void;
    closePanel(): void;
    onScroll(): void;
}

interface ICommentsPanelProps {
    cardId: string;
    selectorResize: string;
    changePageEventer: Subject<string>;
    boardOwner: IBoardOwner;
}

interface ICommentsPanelScope extends IScope, ICommentsPanelProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    cardId: string;
    isOpened: boolean;
    comments: CardComment[];
    nbOfComments: number;
    boardOwner: IBoardOwner;


    filter: {
        page: number;
    };

    changePageEventer: Subject<string>;

    infiniteScrollService: InfiniteScrollService;
    selectorResize: string;


    constructor(private $scope: ICommentsPanelScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.comments = [];
        this.isOpened = false;
        this.filter = {
            page: 0
        };
        this.nbOfComments = 0;
        this.infiniteScrollService = new InfiniteScrollService;
    }

    async $onInit() {
        await this.getComments();
        if (this.changePageEventer) {
            this.changePageEventer.subscribe(async (cardId: string) => {
                this.cardId = cardId;
                this.comments = [];
                this.filter.page = 0;
                await this.getComments();
                safeApply(this.$scope);
            });
        }
    }

    togglePanel = (): void => {
        this.isOpened = !this.isOpened;
    }

    closePanel = (): void => {
        this.isOpened = false;
    }

    getComments = async (): Promise<void> => {
        commentsService.getComments(this.cardId, this.filter.page)
            .then((res: CardComments) => {
                this.nbOfComments = res.count ? res.count : 0;

                if (res.all && res.all.length > 0) {
                    this.comments.push(...res.all);
                    this.infiniteScrollService.updateScroll();
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message);
            });
    }

    onCommentSubmit = (comment: CardComment): void => {
        this.comments.push(comment);
        this.nbOfComments++;
        safeApply(this.$scope);
    }

    onCommentDelete = (commentId: string): void => {
        this.comments = this.comments.filter((comment: CardComment) => comment.id !== commentId);
        this.nbOfComments--;
        safeApply(this.$scope);
    }

    /**
     * On scroll callback:
     * - load more comments if scroll is at the bottom of the page
     */
    onScroll = async (): Promise<void> => {
        if (this.comments.length > 0) {
            this.filter.page++;
            await this.getComments();
        }
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}comments-panel/comments-panel.html`,
        scope: {
            cardId: '=',
            changePageEventer: '=',
            boardOwner: '=',
            selectorResize: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICommentsPanelScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

        }
    }
}

export const commentsPanel = ng.directive('commentsPanel', directive)