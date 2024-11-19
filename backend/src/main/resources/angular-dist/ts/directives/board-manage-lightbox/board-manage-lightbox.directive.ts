import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import {BoardForm} from "../../models";
import {hasRight} from "../../utils/rights.utils";

interface IViewModel extends ng.IController, IBoardManageProps {
    submitBoard?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;

    hasRight: typeof hasRight;
}

interface IBoardManageProps {
    display: boolean;
    isUpdate: boolean;
    form: BoardForm;
    folderId: string;
    onSubmit?;
}

interface IBoardManageScope extends IScope, IBoardManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isUpdate: boolean;
    form: BoardForm;
    folderId: string;
    onSubmit: () => void;
    hasRight: typeof hasRight = hasRight;

    constructor(private $scope: IBoardManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    isFormValid = (): boolean => {
        return this.form && this.form.isValid();
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
        templateUrl: `${RootsConst.directive}board-manage-lightbox/board-manage-lightbox.html`,
        scope: {
            display: '=',
            isUpdate: '=',
            onSubmit: '&',
            form: '=',
            folderId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitBoard = async (): Promise<void> => {
                try {
                    let form : BoardForm = new BoardForm();
                    form.title = vm.form.title;
                    form.description = vm.form.description;
                    form.imageUrl = vm.form.imageUrl;
                    form.backgroundUrl = vm.form.backgroundUrl;
                    form.folderId = vm.folderId;
                    form.tags = vm.form.tags;
                    form.public = vm.form.public;
                    form.layoutType = vm.form.layoutType;
                    form.canComment = vm.form.canComment;
                    form.displayNbFavorites = vm.form.displayNbFavorites;

                    if (vm.isUpdate) {
                        await boardsService.updateBoard(vm.form.id, form);
                        $parse($scope.vm.onSubmit())({});
                        vm.closeForm();
                    } else {
                        boardsService.createBoard(form)
                            .then(res => {
                                $parse($scope.vm.onSubmit())({id: res.data.id});
                                vm.closeForm();
                            });
                    }

                } catch (e) {
                    throw e;
                }
            };
        }
    }
}

export const boardManageLightbox = ng.directive('boardManageLightbox', directive)