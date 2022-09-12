import {ng} from 'entcore';
import {ILocationService, IScope, IWindowService} from "angular";

declare let window: any;

interface IViewModel {

}

class Controller implements ng.IController, IViewModel {

	constructor(private $scope: IScope,
				private $location:ILocationService,
				private $window: IWindowService) {
		this.$scope['vm'] = this;
	}

	$onInit() {
		route({
			list: () => {
				template.open('main', `second-page`);
			},
			list2: () => {
				template.open('main', `third-page`);
			},
			defaultView: () => {
				template.open('main', `main`);
			}
		});
	}

	$onDestroy() {
	}
}

export const mainController = ng.controller('MainController',
	['$scope', 'route', '$window', Controller]);
