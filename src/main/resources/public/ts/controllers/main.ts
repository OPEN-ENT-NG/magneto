import {ng, template} from 'entcore';
import {IScope, IWindowService} from "angular";

declare let window: any;

interface IViewModel {

}

class Controller implements ng.IController, IViewModel {

	constructor(private $scope: IScope,
				private $route: any,
				private $window: IWindowService) {
		this.$scope['vm'] = this;
	}

	$onInit() {
		this.$route({
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
