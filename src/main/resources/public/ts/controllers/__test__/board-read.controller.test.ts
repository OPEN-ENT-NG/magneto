import * as angular from 'angular';
import 'angular-mocks';
import {boardReadController} from "../board-read.controller";
import {ng} from "../../models/__mocks__/entcore";
import {boardsService, cardsService} from "../../services";
import {Board, Card, Section} from "../../models";
import {LAYOUT_TYPE} from "../../core/enums/layout-type.enum";
import * as jquery from "jquery";

window.$ = jquery
window.$().on = jest.fn();

describe("BoardReadController", () => {

    let boardReadControllerTest: any;
    let section: Section = new Section().build({
        _id: "id",
        boardId: "",
        cardIds: [],
        title: ""
    });

    let board: Board = new Board().build({
        _id: "id",
        backgroundUrl: "",
        canComment: false,
        displayNbFavorites: false,
        cardIds: ["1", "2"],
        creationDate: "",
        deleted: false,
        description: "",
        folderId: "",
        imageUrl: "",
        layoutType: LAYOUT_TYPE.FREE,
        modificationDate: "",
        nbCards: 0,
        nbCardsSections: 0,
        ownerId: "",
        ownerName: "",
        public: false,
        sections: [section],
        shared: [],
        tags: undefined,
        title: ""
    });

    beforeEach(() => {
        const testApp = angular.module("app", []);
        let $controller, $rootScope, $sce;

        angular.mock.module("app");

        boardReadController;

        ng.initMockedModules(testApp);

        // Controller Injection
        angular.mock.inject((_$controller_, _$rootScope_, _$sce_) => {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $sce = _$sce_;
        });

        // Creates a new instance of scope
        let $scope = $rootScope.$new();

        // Fetching $location
        testApp.run(($rootScope, $location) => {
            $rootScope.location = $location;
        });

        boardReadControllerTest = $controller("BoardReadController", {
            $scope: $scope,
            $route: $rootScope,
            $location: $rootScope.location,
            $sce: $sce,
            boardsService: boardsService,
            cardsService: cardsService,
            board: new Board()
        });

        //boardReadControllerTest.$route.current.params.boardId = "boardId";

        // intercept operation "await this.getBoards();" $onInit()
        boardReadControllerTest.boardsService.getBoardsByIds = jest.fn()
            .mockImplementation(() => {
                return Promise.resolve({
                    all: [board],
                    page: 0,
                    pageCount: 0
                });
                // return Promise.resolve(undefined);
            });

        // intercept operation "this.deletedFolders = await this.getDeletedFolders();" $onInit()
        boardReadControllerTest.cardsService.getCardById = jest.fn()
            .mockImplementation(() => {
                return Promise.resolve( new Card().build({
                    boardId: "",
                    caption: "",
                    creationDate: "",
                    description: "",
                    lastModifierId: "",
                    lastModifierName: "",
                    locked: false,
                    metadata: undefined,
                    modificationDate: "",
                    ownerId: "",
                    ownerName: "",
                    parentId: "",
                    resourceId: "",
                    resourceType: "",
                    resourceUrl: "",
                    title: ""
                }));
            });

        boardReadControllerTest.handlerChangePage = jest.fn()

        boardReadControllerTest.$onInit();
    });

    it("test nextPage", (done) => {
        boardReadControllerTest.filter = {
            page: 0,
            count: 2,
            boardId: "boardId"
        };

        boardReadControllerTest.nextPage();

        expect(boardReadControllerTest.filter.page).toEqual(1);
        done();
    });

    it("test nextPage", (done) => {
        boardReadControllerTest.filter = {
            page: 1,
            count: 2,
            boardId: "boardId"
        };

        boardReadControllerTest.previousPage();

        expect(boardReadControllerTest.filter.page).toEqual(0);
        done();
    });

    it("test isLastPage", (done) => {
        boardReadControllerTest.filter = {
            page: 1,
            count: 2,
            boardId: "boardId"
        };

        expect(boardReadControllerTest.isLastPage()).toBe(true);
        done();
    });
});