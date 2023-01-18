import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Card, ISectionBoardParamsRequest, Section, SectionForm} from "../../models";
import {sectionsService} from "../../services";
import {boolean} from "yargs";

interface IViewModel extends ng.IController, ISectionListProps {
    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    openPreview?(card: Card): void;

    openTransfer?(card: Card): void;

    onFormSubmit?(): void;

    createSection(section: SectionForm): Promise<void>;

    duplicateSection?(section: Section): void;

    openDeleteSectionLightbox(section: Section): void;

    refresh?(): void;

}

interface ISectionListProps {
    onEdit?;
    onDuplicate?;
    onHide?;
    onDelete?;
    onPreview?;
    onTransfer?;
    onMove?;
    onSubmit?;
}

interface ISectionListScope extends IScope, ISectionListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    newSection: SectionForm;

    selectedSection: Section;
    displayDeleteSectionLightbox: boolean;


    constructor(private $scope: ISectionListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit = (): void => {
        this.selectedSection = new Section();
        this.displayDeleteSectionLightbox = false;
        this.newSection = new SectionForm().buildNew(this.board.id);
    }

    $onDestroy() {
    }

    createSection = async (section: SectionForm): Promise<void> => {
        await sectionsService.create(section);
        this.newSection = new SectionForm().buildNew(this.board.id);
        this.$scope.vm.refresh();
    }

    /**
     * Open section deletion lightbox.
     */
    openDeleteSectionLightbox = (section: Section): void => {
        this.selectedSection = section;
        this.displayDeleteSectionLightbox = true;
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}section-list/section-list.html`,
        scope: {
            board: '=',
            onEdit: '&',
            onDuplicate: '&',
            onHide: '&',
            onDelete: '&',
            onPreview: '&',
            onTransfer: '&',
            onMove: '&',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ISectionListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

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

            vm.duplicateSection = async (section: Section): Promise<void> => {
                try {
                    const duplicateSection: ISectionBoardParamsRequest = {
                        sectionIds: [section.id],
                        boardId: vm.board.id
                    };
                    await sectionsService.duplicate(duplicateSection).then(result => {
                        if (result.status == 200 || result.data == 201) {
                            toasts.confirm('magneto.duplicate.elements.confirm');
                            $parse($scope.vm.onSubmit())({});
                        } else {
                            toasts.warning('magneto.duplicate.elements.error');
                        }
                    });
                } catch (e) {
                    throw e;
                }
            }

            vm.onFormSubmit = (): void => {
                $parse($scope.vm.onSubmit())({});
            }

            vm.refresh= (): void => {
                $parse($scope.vm.onMove())({});
            }
        }
    }
}

export const sectionList = ng.directive('sectionList', directive)