import {ng, ShareAction, SharePayload} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import http from "axios";

interface IViewModel extends ng.IController, ISharePanelProps {

    onShare(shared: {users: {[userId: string]: string[]},
        groups: {[groupId: string]: string[]},
        bookmarks: {[bookmarkId: string]: string[]}}): void;
}

interface ISharePanelProps {
    display: boolean;
    resources: ShareableWithId[] | ShareableWithId;
    appPrefix: string;
    onSubmit?;
    onValidate?;
}

interface ISharePanelScope extends IScope, ISharePanelProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    resources: ShareableWithId[] | ShareableWithId;
    appPrefix: string;

    constructor(private $scope: ISharePanelScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.display = false;
    }

    closeForm = async (): Promise<void> => {
        let ids = await boardsService.getAllDocumentIds(this.resources[0]['_id'])
        console.log(ids);
        this.display = false;
    }

    $onDestroy() {
    }

    onShare = async (shared: {users: {[userId: string]: string[]},
        groups: {[groupId: string]: string[]}, bookmarks: {[bookmarkId: string]: string[]}}) => {
        boardsService.getAllDocumentIds(this.resources[0]['_id']).then(async (ids) => {
            let documentIds: string[] = ids['documents'];
            await boardsService.syncDocumentSharing(documentIds, shared);
        })
    }
}

class ShareableWithId {
}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}share-panel-lightbox/share-panel-lightbox.html`,
        scope: {
            display: '=',
            resources: '=',
            appPrefix: '=',
            onSubmit: '&',
            onValidate: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ISharePanelScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {


            vm.onSubmit = (args: { $shared: SharePayload }): void => {
                $parse($scope.vm.onSubmit)(args);
            }

            vm.onValidate = (args: {
                $data: SharePayload,
                $resource: ShareableWithId,
                $actions: ShareAction[]}): void => {
                $parse($scope.vm.onValidate)(args);
            }
        }
    }
}

export const sharePanelLightbox = ng.directive('sharePanelLightbox', directive)
