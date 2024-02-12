import {ng, ShareAction, SharePayload} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {I18nUtils} from "../../utils/i18n.utils";
import {Folder} from "../../models";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";

interface IViewModel extends ng.IController, ISharePanelProps {
    translate?(key: string, param: string): string;
    parentFolderIsShared?(): boolean;
}

interface ISharePanelProps {
    display: boolean;
    resources: ShareableWithId[] | ShareableWithId;
    appPrefix: string;
    parentFolder: Folder;
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
    parentFolder: Folder;

    constructor(private $scope: ISharePanelScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.display = false;
    }

    translate(key: string, param: string): string {
        return I18nUtils.getWithParams(key, [param]);
    }

    parentFolderIsShared = (): boolean => {
        let isMyBoards: boolean = this.$scope.$parent['vm'].filter.isMyBoards;
        let isNotMainPage: boolean = this.parentFolder != null && this.parentFolder.id != FOLDER_TYPE.MY_BOARDS;
        let parentFolderIsShared: boolean = !!this.parentFolder && !!this.parentFolder.shared && this.parentFolder.shared.length > 0;

        return isMyBoards && isNotMainPage && parentFolderIsShared;
    }

    closeForm = async (): Promise<void> => {
        this.display = false;
        await this.$scope.$parent['vm'].onFormSubmit();

    }

    $onDestroy() {
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
            parentFolder: '=',
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
