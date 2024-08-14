import {model, ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {CardComment} from "../../models/card-comment.model";
import {KEYCODE} from "../../core/constants/keycode.const";
import {commentsService} from "../../services";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, ICommentInputProps {
    commentInput: string;

    getUserId(): string;
    addComment?($event: JQueryEventObject): Promise<void>;
}

interface ICommentInputProps {
    cardId: string;
    onSubmit?;
}

interface ICommentInputScope extends IScope, ICommentInputProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    commentInput: string;
    cardId: string;

    constructor(private $scope: ICommentInputScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    async $onInit() {
        this.commentInput = "";
    }

    $onDestroy() {
    }

    getUserId = (): string => {
        return model.me.userId;
    }
}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}comment-input/comment-input.html`,
        scope: {
            cardId: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICommentInputScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.addComment = async ($event: JQueryEventObject): Promise<void> => {
                if ($event.keyCode == KEYCODE.ENTER) {
                    try {
                        commentsService.addComment(vm.cardId, vm.commentInput).then((comment: CardComment) => {
                            vm.commentInput = "";
                            $parse($scope.vm.onSubmit())(comment);
                            safeApply(vm.$scope);

                        }).catch((err) => {
                            toasts.warning('magneto.add.comment.error');
                        });


                    } catch (e) {
                        toasts.warning('magneto.add.comment.error');
                    }
                }
            }


        }
    }
}

export const commentInput = ng.directive('commentInput', directive)