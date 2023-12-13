import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, CardForm, Section} from "../../models";
import {boardsService, cardsService} from "../../services";
import {EXTENSION_FORMAT} from "../../core/constants/extension-format.const";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, ICardManageProps {
    submitCard?(): Promise<void>;

    videoIsFromWorkspace(): boolean;

    isFormValid(): boolean;

    hasSection(): boolean;

    closeForm(): void;

    getFileExtension(): string;

    formatVideoUrl(url: string) : string;

    displayEmbedder(): void

    changeUrl(): void
}

interface ICardManageProps {
    display: boolean;
    isUpdate: boolean;
    form: CardForm;
    board: Board;
    onSubmit?;
    displayChangeVideoLightbox: boolean;
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
    displayChangeVideoLightbox: boolean;
    videoUrl: string;

    constructor(private $scope: ICardManageScope,
                private $location: ILocationService,
                private $sce: ng.ISCEService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
    }

    $onInit() {
        this.displayChangeVideoLightbox = false;
        this.videoUrl = this.form.resourceUrl;
        this.selectedSection = this.board.sections && this.board.sections.length > 0 ? this.board.sections[0] : null;
        if(!this.isUpdate)
            this.form.title = this.form.resourceFileName.replace(/\.[^/.]+$/, "");
    }

    isFormValid = (): boolean => {
        return this.form.isValid();
    }

    formatVideoUrl = (url: string) : string | undefined | null => {
        if(typeof url === 'string') {
            return this.$sce.trustAsResourceUrl(url);
        }
        return url;
    }

    displayEmbedder = (): void => {
        this.displayChangeVideoLightbox = true;
    }

    changeUrl = (): void => {
        this.displayChangeVideoLightbox = false;

        // Video from workspace
        if (this.videoUrl.includes("workspace")) {
            const regex: RegExp= /\/workspace\/document\/[a-f0-9-]+/;
            const match: RegExpExecArray = regex.exec(this.videoUrl);
            this.form.resourceUrl = match[0];
        }
        // Video from URL
        else {
            this.form.resourceUrl = this.$sce.trustAsResourceUrl(
                this.videoUrl.split("src=\"")[1].split('"')[0]);
        }
        safeApply(this.$scope);
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
        controller: ['$scope', '$location', '$sce', '$window', '$parse', Controller],
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

                    // Allows to retrieve values in JQuery when there is a link or text
                    if (vm.form.description || vm.form.description == '') {
                        let linkHref: string = $("div[role='textbox'] span").find("a").attr("href");
                        let linkText: string = $("div[role='textbox'] span").find("a").text();

                        if (linkHref && linkText) {
                            vm.form.description = "<a href='" + linkHref + "'>" + linkText + "</a>";
                        }
                    }

                    vm.isUpdate ? await cardsService.updateCard(vm.form) : await cardsService.createCard(vm.form);

                    if (!vm.isUpdate && vm.board.isMyBoard())
                        await shareDocument();
                } catch (e) {
                    console.error(e);
                }

                $parse($scope.vm.onSubmit())({});
            };

            let shareDocument = async () => {
                // We need to format the shared object for sharing the associated document
                let formattedShare = {
                    users: {},
                    groups: {},
                    bookmarks: {}
                };

                const rights: string[] = [
                    'fr-cgi-magneto-controller-ShareBoardController|initContribRight',
                    'fr-cgi-magneto-controller-ShareBoardController|initManagerRight',
                    'fr-cgi-magneto-controller-ShareBoardController|initPublishRight',
                    'fr-cgi-magneto-controller-ShareBoardController|initReadRight'
                ];

                for (let u in vm.board.shared) {
                    let userOrGroup = vm.board.shared[u];

                    if (userOrGroup['userId'] !== undefined) {
                        let userId = userOrGroup['userId'];
                        formattedShare.users[userId] = [];

                        for (let right of rights) {
                            if (userOrGroup[right] === true) {
                                formattedShare.users[userId].push(right);
                            }
                        }
                    } else if (userOrGroup['groupId'] !== undefined) {
                        let groupId = userOrGroup['groupId'];
                        formattedShare.groups[groupId] = [];

                        for (let right of rights) {
                            if (userOrGroup[right] === true) {
                                formattedShare.groups[groupId].push(right);
                            }
                        }
                    }
                }

                formattedShare.users[vm.board.owner.userId] = rights;

                await boardsService.syncDocumentSharing([vm.form.resourceId], formattedShare);
            }
        }
    }
}

export const cardManageLightbox = ng.directive('cardManageLightbox', directive)
