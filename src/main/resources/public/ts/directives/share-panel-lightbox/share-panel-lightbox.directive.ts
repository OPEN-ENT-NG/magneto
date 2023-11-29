import {ng, ShareAction, SharePayload} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import http from "axios";

interface IViewModel extends ng.IController, ISharePanelProps {

    onShare(shared: { bookmarks: any, groups: any, users: any }): void;
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

    onShare = async (shared: { bookmarks: any, groups: any, users: any }) => {
        console.log(shared);
        let ids = await boardsService.getAllDocumentIds(this.resources[0]['_id']);
            let docids = ids['documents'];
        console.log(ids);

        let shareBody = {
            users: {},
            groups: {},
            bookmarks: {}
        };

        for (let userId in shared.users) {
            console.log("UserId:", userId);


            shareBody.users[userId] = [
                "org-entcore-workspace-controllers-WorkspaceController|getDocument",
                "org-entcore-workspace-controllers-WorkspaceController|copyDocuments",
                "org-entcore-workspace-controllers-WorkspaceController|getDocumentProperties",
                "org-entcore-workspace-controllers-WorkspaceController|getRevision",
                "org-entcore-workspace-controllers-WorkspaceController|copyFolder",
                "org-entcore-workspace-controllers-WorkspaceController|getPreview",
                "org-entcore-workspace-controllers-WorkspaceController|copyDocument",
                "org-entcore-workspace-controllers-WorkspaceController|getDocumentBase64",
                "org-entcore-workspace-controllers-WorkspaceController|listRevisions"
            ];

            //TODO ajouter org-entcore-workspace-controllers-WorkspaceController|updateDocument si droit modif magneto

        }

        console.log(shareBody);

        for (let docId of docids) {
            if (docId !== '')
                await http.put('/workspace/share/resource/' + docId, shareBody);
        }

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
