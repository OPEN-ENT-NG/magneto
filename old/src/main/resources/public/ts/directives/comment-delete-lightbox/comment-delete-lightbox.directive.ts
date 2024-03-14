import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {commentsService} from "../../services";
import {CardComment} from "../../models/card-comment.model";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, ICommentDeleteProps {
    submitDelete?(): Promise<void>;
    closeForm(): void;

    cardId: string;
    commentId: string;
}

interface ICommentDeleteProps {
    onSubmit?;
    display: boolean;
    cardId: string;
    commentId: string;
}

interface ICardDeleteScope extends IScope, ICommentDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    cardId: string;
    commentId: string;

    constructor(private $scope: ICardDeleteScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.display = false;
    }

    closeForm = (): void => {
        this.display = false;
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}comment-delete-lightbox/comment-delete-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            commentId: '=',
            cardId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDelete = async (): Promise<void> => {
                try {
                    if (vm.cardId !== undefined && vm.commentId !== undefined) {
                        await commentsService.deleteComment(vm.cardId, vm.commentId);
                    }
                    $parse($scope.vm.onSubmit())(vm.commentId);
                    vm.closeForm();
                    safeApply(vm.$scope);
                } catch (e) {
                    toasts.warning('magneto.delete.comment.error');
                    console.error(e);
                }
            }
        }
    }
}

export const commentDeleteLightbox = ng.directive('commentDeleteLightbox', directive)