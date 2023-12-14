import {angular, ng, notify, toasts} from "entcore";
import {IParseService, IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Card, Cards, ICardsSectionParamsRequest, Section, SectionForm} from "../../models";
import {cardsService, sectionsService} from "../../services";
import {safeApply} from "../../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../../shared/services";
import {Subject} from "rxjs";

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

    formatSectionSelector(section: Section): string;

    formatSectionContainerSelector(section: Section, isIdentifier: boolean): string;

    onLoaded(): void;

    isDisplayedOptions: boolean;
    displayed:boolean;
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
    cardUpdateEventer: Subject<void>;
    zoom: number;
    zoomEventer: Subject<void>;
}

interface ISectionListItemScope extends IScope, ISectionListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    section: Section;
    newSection: SectionForm;

    infiniteScrollService: InfiniteScrollService;

    isLoading: boolean;
    isDisplayedOptions: boolean;
    isDomLoaded: boolean;
    cardUpdateEventer: Subject<void>;
    zoom: number;
    zoomEventer: Subject<void>;
    displayed: boolean;
    constructor(private $scope: ISectionListItemScope) {
        this.isDisplayedOptions = false;
        this.isLoading = false;
        this.isDomLoaded = false;
        this.infiniteScrollService = new InfiniteScrollService();
    }

    $onInit = (): void => {
        this.newSection = new SectionForm().buildNew(this.board.id);
    }

    $onDestroy() {
    }

    formatSectionSelector = (section: Section): string => {
        return "#section-" + section.id;
    }

    formatSectionContainerSelector = (section: Section, isIdentifier: boolean): string => {
        return isIdentifier ? "section-container-" + section.id : "#section-container-" + section.id;
    }

    updateSection = async (section: Section): Promise<void> => {

        let updateSection: SectionForm = new SectionForm().build(section);
        await sectionsService.update(updateSection).then(response => {
            if (response.status === 200 || response.status === 201) {
                toasts.confirm("magneto.update.section.confirm")
            } else {
                toasts.warning("magneto.update.section.error")
            }
        });
        this.$scope.vm.refresh();
    }

    /**
     * Callback on infinite scroll
     */
    onScroll = async (): Promise<void> => {
        if (this.section.cards && this.section.cards.length > 0) {
            this.section.page++;
            await this.getCardsBySection();
        }
    }

    /**
     * Fetch board cards by section.
     */
    getCardsBySection = async (): Promise<void> => {
        this.isLoading = true;
        const params: ICardsSectionParamsRequest = {
            page: this.section.page,
            sectionId: this.section.id
        };
        cardsService.getAllCardsBySection(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    this.section.cards.push(...res.all);
                    this.infiniteScrollService.updateScroll();
                    this.cardUpdateEventer.next();
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message);
            });
    }

    onLoaded = (): void => {
        this.isDomLoaded = true;
        safeApply(this.$scope);
    }

    openHide = (): void =>{
        this.section.displayed = !this.section.displayed;
        this.isDisplayedOptions = false;
        sectionsService.update(new SectionForm().build(this.section));
        safeApply(this.$scope)
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
            onLock: '&',
            cardUpdateEventer: '=',
            zoom:"=?",
            zoomEventer:"=?",
            hasLongerReposition: '='
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

            let selectReposition = (): string => {
                return (vm.hasLongerReposition != null && vm.hasLongerReposition ? 'longer-reposition' : 'reposition');
            }

            let repositionActionOptions = (): void => {
                let windowElem: JQuery = $(vm.formatSectionSelector(vm.section));
                let actionOptionsElem: JQuery =
                    $("#options-" + vm.section.id);
                let repositionClass: string = selectReposition();
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
