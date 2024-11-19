import { ng, routes } from 'entcore';
import * as controllers from './controllers';
import * as directives from './directives';
import * as services from './services';

for(let controller in controllers){
    ng.controllers.push(controllers[controller]);
}

for (let directive in directives) {
	ng.directives.push(directives[directive]);
}

for (let service in services) {
	ng.services.push(services[service]);
}

routes.define(function($routeProvider){
	$routeProvider
		.when('/', {
			action: 'boards'
		})
		.when('/board/view/:boardId', {
			action: 'board'
		})
		.when('/board/view/reading/:boardId', {
			action: 'boardRead'
		})
		.otherwise({
			redirectTo: '/'
		});
})