import {idiom, ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {EXTENSION_FORMAT} from "../../core/constants/extension-format.const";
import {Dailymotion, PeerTube, Vimeo, Youtube} from "../../models/video-platform.model";

interface IViewModel extends ng.IController, ICardListItemProps {
    getExtension(fileName: string): string;

    getResourceType(resourceType: string): string;

    videoIsFromWorkspace(): boolean;

    formatVideoUrl(url: string): Promise<void>;

    getDescriptionHTML(description: string): string;

    getApplication(): string;
}

interface ICardListItemProps {
    card: Card;
}

interface ICardListItemScope extends IScope, ICardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    RESOURCE_TYPES: typeof RESOURCE_TYPE;
    url: string;


    constructor(private $scope: ICardListItemScope,
                private $location: ILocationService,
                private $sce: ng.ISCEService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
    }


    async $onInit() {
        await this.formatVideoUrl(this.card.resourceUrl);
        this.$scope.$apply();
    }

    $onDestroy() {
    }

    getExtension = (fileName: string): string => {
        let result: string = this.RESOURCE_TYPES.DEFAULT;
        if (!!fileName) {
            let extension: string;
            extension = fileName.split('.').pop();
            result = this.getExtensionType(extension);
        }
        return result;
    }

    videoIsFromWorkspace = (): boolean => {
        return this.card.resourceUrl ?
            this.card.resourceUrl.toString().includes("workspace") : false;
    }

    getDescriptionHTML = (description: string): string => {
        return !!description ? this.$sce.trustAsHtml(description) : null;
    }

    getApplication(): string {
        if (!this.card || !this.card.resourceUrl) {
            return "default";
        }
        const parts: string[] = this.card.resourceUrl.split("/");
        if (parts.length == 0) {
            return "default";
        } else {
            return parts[0] == "" ?
                (parts.length > 1 ? parts[1].replace("#", "") : "default") : // case url is ODE type : /magneto#/etc..
                (parts.length > 3 ? parts[3].replace("#", "") : "default"); // case url is Formulaire type http://plateform/formulaire#
        }
    }

    formatVideoUrl = async (url: string): Promise<void> => {
        if (url.includes("peertube")) {
            this.url = await new PeerTube(url).getThumbnail();
        } else if (url.includes("vimeo")) {
            this.url = await new Vimeo(url).getThumbnail();
        } else if (url.includes("dailymotion")) {
            this.url = await new Dailymotion(url).getThumbnail();
        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
            this.url = new Youtube(url).getThumbnail();
        }
        this.url = this.$sce.trustAsResourceUrl(this.url).toString();

    }


    private getExtensionType = (extension: string): string => {
        let result: string = "";
        if (EXTENSION_FORMAT.TEXT.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.TEXT;
        } else if (EXTENSION_FORMAT.PDF.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.PDF;
        } else if (EXTENSION_FORMAT.IMAGE.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.IMAGE;
        } else if (EXTENSION_FORMAT.AUDIO.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.AUDIO;
        } else if (EXTENSION_FORMAT.VIDEO.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.VIDEO;
        } else if (EXTENSION_FORMAT.SHEET.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.SHEET;
        } else {
            result = this.RESOURCE_TYPES.DEFAULT;
        }
        return result;
    }

    getResourceType = (): string => {
        return idiom.translate('magneto.card.type.' + this.card.resourceType);
    }

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item-preview.html`,
        scope: {
            card: '=',
            resourceType: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const cardListItemPreview = ng.directive('cardListItemPreview', directive)