import {model, ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {KEYCODE} from "../../core/constants/keycode.const";
import {cardsService, commentsService} from "../../services";
import {Card} from "../../models";
import {CardComment} from "../../models/card-comment.model";
import {safeApply} from "../../utils/safe-apply.utils";
import {DateUtils} from "../../utils/date.utils";
import {Subject} from "rxjs";

interface IViewModel extends ng.IController, ICardItemCommentsProps {
    onCommentSubmit: (comment: CardComment) => Promise<void>;
    onCommentDelete: (commentId: string) => Promise<void>
}

interface ICardItemCommentsProps {
    card: Card;
    cardUpdateEventer: Subject<void>;
}

interface ICardItemCommentsScope extends IScope, ICardItemCommentsProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    cardUpdateEventer: Subject<void>;


    constructor(private $scope: ICardItemCommentsScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

    onCommentSubmit = async (comment: CardComment): Promise<void> => {
        this.card.lastComment = comment;
        this.card.nbOfComments++;
        this.cardUpdateEventer.next();
    }

    onCommentDelete = async (commentId: string): Promise<void> => {
        cardsService.getCardById(this.card.id)
            .then((card: Card) => {
                this.card.nbOfComments = card.nbOfComments;
                this.card.lastComment = card.lastComment;
                this.cardUpdateEventer.next();
                safeApply(this.$scope);
            })
            .catch((err) => {
                toasts.warning("magneto.delete.comment.error");
            });
    }
}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-item-comments/card-item-comments.html`,
        scope: {
            card: '=',
            cardUpdateEventer: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardItemCommentsScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

        }
    }
}

export const cardItemComments = ng.directive('cardItemComments', directive)