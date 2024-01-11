import {angular, ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {I18nUtils} from "../../utils/i18n.utils";

interface IViewModel extends ng.IController, IMessageProps {
    translate?(key: string, param: string[]): string;
    confirm?(): Promise<void>;
    cancel?(): void;
}

interface IMessageProps {
    display: boolean;
    key: string;
    params: string[];

    onSubmit?;
    onClose?;
}

interface IMessageScope extends IScope, IMessageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    key: string;
    params: string[];

    constructor(private $scope: IMessageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.display = false;
    }

    translate(key: string, param: string[]): string {
        if (!!param) {
            return I18nUtils.getWithParams(key, param);
        }
        return I18nUtils.translate(key);
    }

    confirm = async (): Promise<void> => {
        await this.$scope.vm.onSubmit();
    }

    cancel = (): void => {
        this.$scope.vm.onClose();
    }

    $onDestroy() {
    }
}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}message-lightbox/message-lightbox.html`,
        scope: {
            display: '=',
            key: '=',
            params: '=',
            onSubmit: '&',
            onClose: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IMessageScope,
                        vm: IViewModel) {
        }
    }
}

export const messageLightbox = ng.directive('messageLightbox', directive)
