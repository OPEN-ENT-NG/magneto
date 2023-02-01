import {angular, ng, toasts} from "entcore";
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

    openLock?(card: Card): void;

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
    onLock?;
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

    formatSectionSelector = (section: Section): string => {
        return "#section-" + section.id;
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
            onMove: '&',
            onLock: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$parse', Controller],
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

            let repositionActionOptions = (): void => {
                let windowElem: JQuery = $(vm.formatSectionSelector(vm.section));
                let actionOptionsElem: JQuery =
                    $("#options-" + vm.section.id);
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
            };

            angular.element(window).bind('resize', async (): Promise<void> => {
                await safeApply($scope); // waiting dom recalculate
                repositionActionOptions();
            });

            vm.openSectionOptions = async (): Promise<void> => {
                vm.isDisplayedOptions = !vm.isDisplayedOptions;
                await safeApply($scope);
                if (vm.isDisplayedOptions) repositionActionOptions();
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

            vm.openLock = (card: Card): void => {
                $parse($scope.vm.onLock())(card);
            }

            vm.refresh = (): void => {
                $parse($scope.vm.onMove())({});
            }
        }
    }
}

export const sectionListItem = ng.directive('sectionListItem', directive)