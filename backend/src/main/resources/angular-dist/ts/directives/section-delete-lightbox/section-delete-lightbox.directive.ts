import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {sectionsService} from "../../services";
import {ISectionDeleteParams} from "../../models";

interface IViewModel extends ng.IController, IBoardDeleteProps {
    submitDelete?(): Promise<void>;

    closeForm(): void;
}

interface IBoardDeleteProps {
    onSubmit?;
    display: boolean;
    sectionIds: Array<string>;
    boardId: string;
}

interface IBoardDeleteScope extends IScope, IBoardDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    deleteCard: boolean;
    sectionIds: Array<string>;
    boardId: string;

    constructor(private $scope: IBoardDeleteScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.deleteCard = true;
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
        templateUrl: `${RootsConst.directive}section-delete-lightbox/section-delete-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            sectionIds: '=',
            boardId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDelete = async (): Promise<void> => {
                try {
                    const deleteSection: ISectionDeleteParams = {
                        sectionIds: vm.sectionIds,
                        boardId: vm.boardId,
                        deleteCards: vm.deleteCard
                    };
                    await sectionsService.delete(deleteSection).then(result => {
                        if (result.status == 200 || result.data == 201) {
                            toasts.confirm('magneto.delete.section.confirm');
                            $parse($scope.vm.onSubmit())({});
                            vm.closeForm();
                        } else {
                            toasts.warning('magneto.delete.section.error');
                        }
                    });
                } catch (e) {
                    throw e;
                }
            }
        }
    }
}

export const sectionDeleteLightbox = ng.directive('sectionDeleteLightbox', directive)