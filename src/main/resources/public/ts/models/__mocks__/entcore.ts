window.scrollTo = jest.fn();

declare let require: any;

export const moment = require('moment');

interface IController {
    name: string,
    contents: any
}
interface IDirective {
    name: string,
    contents: any
}
interface IService {
    name: string,
    contents: any
}

const controllers: Array<IController> = []
const directives: Array<IDirective> = []
const services: Array<IService> = [];

export const ng = {
    service: jest.fn((name:string, contents: any) => {
        if (ng && ng.services && typeof ng.services.length === 'number')
            ng.services.push({name, contents})
    }),
    directive: jest.fn((name:string, contents: any) => {
        if (ng && ng.directives && typeof ng.directives.length === 'number')
            ng.directives.push({name, contents})
    }),
    controller: jest.fn((name:string, contents: any) => {
        if (ng && ng.controllers && typeof ng.controllers.length === 'number')
            ng.controllers.push({name, contents})
    }),
    // init services, controller and directives
    initMockedModules: jest.fn((app: any) => {
        if (ng && app) {
            if (ng.services) ng.services.forEach((s) => app.service(s.name, s.contents));
            if (ng.directives) ng.directives.forEach((d) => app.directive(d.name, d.contents));
            if (ng.controllers) ng.controllers.forEach((c) => app.controller(c.name, c.contents));
        }
    }),
    controllers: controllers,
    directives: directives,
    services: services
};

export const model = {
    calendar: {
        dayForWeek: '2017-01-12T14:00:00.000+01:00'
    },
    me: {
        userId: '7b6459f5-2765-45b5-8086-d5b3f422e69e',
        type: 'PERSEDUCNAT',
        hasWorkflow: jest.fn(() => true),
        hasRight: jest.fn(() => true)
    },
};

export const Behaviours = {
    applicationsBehaviours: {
        magneto: {
            resource: jest.fn((resource: any) => resource)
        }
    }
}

export const idiom = {
    translate: jest.fn((key: string) => key)
};