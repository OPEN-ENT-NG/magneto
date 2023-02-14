import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, CardForm, Section} from "../../models";
import {cardsService} from "../../services";
import {EXTENSION_FORMAT} from "../../core/constants/extension-format.const";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";

interface IViewModel extends ng.IController, ICardManageProps {
    submitCard?(): Promise<void>;

    videoIsFromWorkspace(): boolean;

    isFormValid(): boolean;

    hasSection(): boolean;

    closeForm(): void;

    getFileExtension(): string;
}

interface ICardManageProps {
    display: boolean;
    isUpdate: boolean;
    form: CardForm;
    board: Board;
    onSubmit?;
}

interface ICardManageScope extends IScope, ICardManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isUpdate: boolean;
    form: CardForm;
    board: Board;
    RESOURCE_TYPES: typeof RESOURCE_TYPE;
    selectedSection: Section;

    constructor(private $scope: ICardManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
    }

    $onInit() {
        this.selectedSection = this.board.sections && this.board.sections.length > 0 ? this.board.sections[0] : null;
    }

    isFormValid = (): boolean => {
        return this.form.isValid();
    }

    hasSection = (): boolean => {
        return !!this.board &&
            !this.board.isLayoutFree() && this.board.sections.length > 0 && !this.isUpdate;
    }

    videoIsFromWorkspace = (): boolean => {
        return this.form.resourceUrl ?
            this.form.resourceUrl.toString().includes("workspace") : false;
    }

    closeForm = (): void => {
        this.display = false;
    }

    getFileExtension = (): string => {
        let result: string = "";
        if (this.form.resourceFileName != "") {
            let extension: string;
            extension = this.form.resourceFileName.split('.').pop();

            if (EXTENSION_FORMAT.TEXT.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.TEXT;
            } else if (EXTENSION_FORMAT.PDF.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.PDF;
            } else if (EXTENSION_FORMAT.IMAGE.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.IMAGE;
            } else if (EXTENSION_FORMAT.AUDIO.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.AUDIO;
            } else if (EXTENSION_FORMAT.VIDEO.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.VIDEO;
            } else if (EXTENSION_FORMAT.SHEET.some((element: string) => element.includes(extension))) {
                result = this.RESOURCE_TYPES.SHEET;
            }
            return result;
        }
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-manage-lightbox/card-manage-lightbox.html`,
        scope: {
            display: '=',
            isUpdate: '=',
            form: '=',
            board: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitCard = async (): Promise<void> => {
                vm.closeForm();
                vm.form.boardId = vm.board.id;
                vm.form.resourceUrl = vm.form.resourceUrl ? vm.form.resourceUrl.toString(): null;
                try {
                    if(!vm.board.isLayoutFree() && vm.board.sections.length > 0 && !vm.isUpdate) {
                        vm.form.sectionId = vm.selectedSection.id;
                    }
                    vm.isUpdate ? await cardsService.updateCard(vm.form) : await cardsService.createCard(vm.form);

                } catch (e) {
                    console.error(e);
                }

                $parse($scope.vm.onSubmit())({});
            };
        }
    }
}

export const cardManageLightbox = ng.directive('cardManageLightbox', directive)