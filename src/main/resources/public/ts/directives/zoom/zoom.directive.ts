import {RootsConst} from "../../core/constants/roots.const";
import {ng, Me} from "entcore";


interface IViewModel extends ng.IController, ICardProfileProps {
    zoomIn(): void;
    zoomOut(): void;
    savePreferences(): Promise<void>
    resetZoom():void;

    zoomReset:number;
}

interface ICardProfileProps {
    zoomLevel: number;
    zoomMax: number;
    zoomMin: number;
    zoomIncrement: number;
    preferences: string;

}

interface IZoomScope extends ICardProfileProps, IViewModel {
    vm: IViewModel;
}

class Controller implements IViewModel {
    zoomLevel: number;
    zoomMax: number;
    zoomMin: number;
    zoomIncrement: number
    zoomReset:number
    preferences: string;

    constructor() {
        if (this.zoomMax === undefined)
            this.zoomMax = 150
        if (this.zoomMin === undefined)
            this.zoomMin = 50
        if (this.zoomIncrement === undefined) {
            this.zoomIncrement = 25
        }
    }

    async $onInit() : Promise<void>{
        await Me.preference('magneto')
        if (!Me.preferences['magneto']) {
            await Me.savePreference('magneto');
            await Me.preference('magneto')
        }
        if (!Me.preferences['magneto'][this.preferences]) {
            Me.preferences['magneto'][this.preferences] = this.zoomLevel;
            await Me.savePreference('magneto');
            await Me.preference('magneto')
        }else{
            this.zoomLevel = Me.preferences['magneto'][this.preferences];
        }
        this.zoomReset = this.zoomLevel;
    }

    async zoomIn(): Promise<void> {
        if (this.zoomLevel < this.zoomMax)
            this.zoomLevel += this.zoomIncrement;
        await this.savePreferences();
    }

    async savePreferences():Promise<void> {
        Me.preferences['magneto'][this.preferences] = this.zoomLevel;
        await Me.savePreference('magneto');
    }

    async zoomOut(): Promise<void> {
        if (this.zoomLevel > this.zoomMin)
            this.zoomLevel -= this.zoomIncrement;
       Me.preferences['magneto'][this.preferences] = this.zoomLevel;
       await Me.savePreference('magneto');
   }

   resetZoom():void {
        this.zoomLevel = this.zoomReset;
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
            preferences: '@'
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