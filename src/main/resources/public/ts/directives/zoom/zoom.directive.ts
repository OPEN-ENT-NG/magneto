import {RootsConst} from "../../core/constants/roots.const";
import {ng, Me} from "entcore";
import {Observable, Subject} from "rxjs";

interface IViewModel extends ng.IController, ICardProfileProps {
    zoomIn(): void;

    zoomOut(): void;

    savePreferences(): Promise<void>

    resetZoom(): void;

    zoomReset: number;
}

interface ICardProfileProps {
    zoomLevel: number;
    zoomMax: number;
    zoomMin: number;
    zoomIncrement: number;
    preferences: string;
    zoomEventer: Subject<void>;
}

interface IZoomScope extends ICardProfileProps, IViewModel {
    vm: IViewModel;
}

class Controller implements IViewModel {
    zoomLevel: number;
    zoomMax: number;
    zoomMin: number;
    zoomIncrement: number
    zoomReset: number
    preferences: string;
    zoomEventer: Subject<void>;

    constructor() {
        if (this.zoomMax === undefined)
            this.zoomMax = 130
        if (this.zoomMin === undefined)
            this.zoomMin = 55
        if (this.zoomIncrement === undefined)
            this.zoomIncrement = 15
    }

    async $onInit(): Promise<void> {
        await Me.preference('magneto')
        if (!Me.preferences['magneto']) {
            await Me.savePreference('magneto');
            await Me.preference('magneto')
        }
        if (!Me.preferences['magneto'][this.preferences]) {
            Me.preferences['magneto'][this.preferences] = this.zoomLevel;
            await Me.savePreference('magneto');
            await Me.preference('magneto')
        } else {
            this.zoomLevel = Me.preferences['magneto'][this.preferences];
        }
        this.zoomReset = this.zoomLevel;
    }

    async zoomIn(): Promise<void> {
        if (this.zoomLevel < this.zoomMax)
            this.zoomLevel += this.zoomIncrement;
        this.zoomEventer.next();
        await this.savePreferences();
    }

    async savePreferences(): Promise<void> {
        Me.preferences['magneto'][this.preferences] = this.zoomLevel;
        await Me.savePreference('magneto');
    }

    async zoomOut(): Promise<void> {
        if (this.zoomLevel > this.zoomMin)
            this.zoomLevel -= this.zoomIncrement;
        Me.preferences['magneto'][this.preferences] = this.zoomLevel;
        this.zoomEventer.next();
        await Me.savePreference('magneto');
    }

    resetZoom(): void {
        this.zoomLevel = this.zoomReset;
        this.zoomEventer.next();
    }

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}zoom/zoom.html`,
        scope: {
            zoomLevel: '=',
            zoomMax: '=?',
            zoomMin: '=?',
            zoomIncrement: '=?',
            preferences: '@',
            zoomEventer: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IZoomScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const zoom = ng.directive('zoom', directive)
