import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Card, Section, SectionForm} from "../../models";
import {sectionsService} from "../../services";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, ISectionListItemProps {
    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    openDeleteSection?(section: Section): void;

    openDuplicateSection?(section: Section): void;

    openPreview?(card: Card): void;

    openTransfer?(card: Card): void;

    updateSection(section: Section): Promise<void>;

    refresh?(): void;

    openSectionOptions?(): Promise<void>;

    isDisplayedOptions: boolean;

}

interface ISectionListItemProps {
    onEdit?;
    onDuplicate?;
    onHide?;
    onDelete?;
    onDeleteSection?;
    onDuplicateSection?;
    onPreview?;
    onTransfer?;
    onMove?;
}

interface ISectionListItemScope extends IScope, ISectionListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    section: Section;
    newSection: SectionForm;
    isDisplayedOptions: boolean;


    constructor(private $scope: ISectionListItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.isDisplayedOptions = false;

    }

    $onInit = (): void => {
        this.newSection = new SectionForm().buildNew(this.board.id);
    }

    $onDestroy() {
    }

    updateSection = async (section: Section): Promise<void> => {
        let updateSection: SectionForm = new SectionForm().build(section);
        updateSection.cardIds = [];
        await sectionsService.update(updateSection).then(response => {
            if (response.status === 200 || response.status === 201) {
                toasts.confirm("magneto.update.section.confirm")
            } else {
                toasts.warning("magneto.update.section.error")
            }
        });
        this.$scope.vm.refresh();
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}section-list/section-list-item.html`,
        scope: {
            board: '=',
            section: '=',
            onEdit: '&',
            onDuplicate: '&',
            onHide: '&',
            onDelete: '&',
            onDeleteSection: '&',
            onDuplicateSection: '&',
            onPreview: '&',
            onTransfer: '&',
            onMove: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ISectionListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            $(document).bind('click', (event: JQueryEventObject): void => {
                if (!element.find(event.target).length && vm.isDisplayedOptions) {
                    vm.isDisplayedOptions = false;
                }
                safeApply($scope);
            });

            vm.openSectionOptions = async (): Promise<void> => {
                vm.isDisplayedOptions = !vm.isDisplayedOptions;
                await safeApply($scope);
            }

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

            vm.openDeleteSection = (section: Section): void => {
                $parse($scope.vm.onDeleteSection())(section);
            }

            vm.openDuplicateSection = (section: Section): void => {
                $parse($scope.vm.onDuplicateSection())(section);
            }

            vm.openPreview = (card: Card): void => {
                $parse($scope.vm.onPreview())(card);
            }

            vm.openTransfer = (card: Card): void => {
                $parse($scope.vm.onTransfer())(card);
            }

            vm.refresh = (): void => {
                $parse($scope.vm.onMove())({});
            }
        }
    }
}

export const sectionListItem = ng.directive('sectionListItem', directive)