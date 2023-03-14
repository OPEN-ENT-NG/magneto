import {angular, model, ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {CardComment} from "../../models/card-comment.model";
import {DateUtils} from "../../utils/date.utils";
import {safeApply} from "../../utils/safe-apply.utils";
import {KEYCODE} from "../../core/constants/keycode.const";
import {commentsService} from "../../services";
import {IBoardOwner} from "../../models";

interface IViewModel extends ng.IController, ICardCommentProps {
    isDisplayedCommentOptions: boolean;
    displayDeleteCommentLightbox: boolean;
    isUpdateComment: boolean;

    updateCommentContent: string;
    comment: CardComment;
    cardId: string;

    openDelete(): void;

    openEdit(): void;

    formatDate(date: string): string;

    formatDateModification(date: string): string;

    isMyComment(): boolean;
    canDeleteComment(): boolean;

    onDeleteFormSubmit?(commentId: string): void;

    openCommentOptions?(): Promise<void>;

    updateComment($event: JQueryEventObject): Promise<void>;
}

interface ICardCommentProps {
    comment: CardComment;
    cardId: string;
    onDelete?;
    boardOwner: IBoardOwner;
    selectorResize: string;
}

interface ICardCommentScope extends IScope, ICardCommentProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    comment: CardComment;
    updateCommentContent: string;
    cardId: string;
    isDisplayedCommentOptions: boolean;
    isUpdateComment: boolean;
    displayDeleteCommentLightbox: boolean;
    boardOwner: IBoardOwner;
    selectorResize: string;


    constructor(private $scope: ICardCommentScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.displayDeleteCommentLightbox = false;
        this.isUpdateComment = false;
        this.updateCommentContent = "";
    }

    $onInit() {
    }

    $onDestroy() {
    }

    openDelete = (): void => {
        this.displayDeleteCommentLightbox = true
        this.isDisplayedCommentOptions = false;
    }

    openEdit = (): void => {
        this.updateCommentContent = this.comment.content;
        this.isUpdateComment = true;
        this.isDisplayedCommentOptions = false;
    }

    formatDateModification = (date: string): string => {
        return DateUtils.createdSince(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR"])
    }

    formatDate = (date: string): string => {
        return DateUtils.format(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR-HOUR-MIN-SEC"])
    }

    isMyComment = (): boolean => {
        return this.comment ? (this.comment.ownerId === model.me.userId) : false;
    }

    canDeleteComment(): boolean {
      return this.isMyComment() || (this.boardOwner && this.boardOwner.userId === model.me.userId);
    }

    updateComment = async ($event: JQueryEventObject): Promise<void> => {
        if ($event.keyCode == KEYCODE.ENTER) {
            commentsService.updateComment(this.cardId, this.comment.id, this.updateCommentContent)
                .then((comment: CardComment) => {
                    this.comment = comment;
                    this.isUpdateComment = false;
                    safeApply(this.$scope);
                }).catch((err) => {
                toasts.warning('magneto.update.comment.error');
            });
        }
    }
}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-comment/card-comment.html`,
        scope: {
            comment: '=',
            cardId: '=',
            onDelete: '&',
            boardOwner: '=',
            selectorResize: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardCommentScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            $(document).bind('click', (event: JQueryEventObject): void => {
                if(!element.find(event.target).length && vm.isDisplayedCommentOptions) {
                    vm.isDisplayedCommentOptions = false;
                    vm.isUpdateComment = false;
                }
                safeApply($scope);
            });

            let repositionActionOptions = (): void => {
                let windowElem: JQuery = vm.selectorResize ? $(vm.selectorResize): $(window);
                let actionOptionsElem: JQuery =
                    $("#options-" + vm.comment.id);

                if (vm.selectorResize === '.card-manage-lightbox') {
                    actionOptionsElem = $(vm.selectorResize).find("#options-" + vm.comment.id);
                }

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

            vm.openCommentOptions = async (): Promise<void> => {
                vm.isDisplayedCommentOptions = true;
                await safeApply($scope);
                if (vm.isDisplayedCommentOptions) {
                    repositionActionOptions();
                }
            }

            vm.onDeleteFormSubmit = (commentId: string): void => {
                $parse($scope.vm.onDelete())(commentId);
            }


        }
    }
}

export const cardComment = ng.directive('cardComment', directive)