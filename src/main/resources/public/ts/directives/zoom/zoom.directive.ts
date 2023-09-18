import {RootsConst} from "../../core/constants/roots.const";
import {ng} from "entcore";


interface IViewModel extends ng.IController, ICardProfileProps {
    zoomIn(): void;
    zoomOut(): void;
}

interface ICardProfileProps {
    zoomLevel:number;
    zoomMax:number;
    zoomMin:number;
    zoomIncrement:number;
}

interface IZoomScope extends ICardProfileProps , IViewModel{
    vm: IViewModel;
}
class Controller implements IViewModel {
    zoomLevel: number;
    zoomMax:number;
    zoomMin:number;
    zoomIncrement:number

    constructor() {
        if(this.zoomMax === undefined)
            this.zoomMax = 150
        if(this.zoomMin === undefined)
            this.zoomMin = 50
        if (this.zoomIncrement === undefined){
            this.zoomIncrement = 25
        }
    }

    zoomIn(): void {
        if (this.zoomLevel < this.zoomMax)
            this.zoomLevel += this.zoomIncrement;
    }

    zoomOut(): void {
        if (this.zoomLevel > this.zoomMin)
            this.zoomLevel -= this.zoomIncrement;
    }

}
function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}zoom/zoom.html`,
        scope: {
            zoomLevel: '=',
            zoomMax:'=?',
            zoomMin:'=?',
            zoomIncrement:'=?'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope','$location','$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IZoomScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}
export const zoom = ng.directive('zoom', directive)