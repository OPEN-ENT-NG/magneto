import * as angular from 'angular';
import * as angularMock from 'angular-mocks/angular-mocks';
window.scrollTo = jest.fn();
import {boardViewController} from "../board-view.controller";
import {ng} from "../../models/__mocks__/entcore";
import {boardsService, cardsService, CardsService} from "../../services";
import {Card, CardForm} from "../../models";

describe("BoardViewController", () => {

    let boardViewControllerTest: any;
    let card: Card = new Card().build({
        id: "id",
        title: "title",
        description: "description",
        modificationDate: "modificationDate",
        caption: "caption",
        resourceId: "resourceId",
        resourceType: "resourceType",
        resourceUrl: "resourceUrl",
        ownerId: "ownerId",
        ownerName: "ownerName",
        creationDate: "creationDate",
        lastModifierId: "lastModifierId",
        lastModifierName: "lastModifierName",
        boardId: "boardId",
        parentId: "parentId",
        locked: false,
        metadata: null
    });

    beforeEach(() => {
        const testApp = angular.module("app", []);
        let $controller, $rootScope, $sce, $window;

        angularMock.module("app");

        boardViewController;

        ng.initMockedModules(testApp);

        // Controller Injection
        angularMock.inject((_$controller_, _$rootScope_, _$sce_, _$window_) => {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $sce = _$sce_;
            $window = _$window_;
        });

        // Creates a new instance of scope
        let $scope = $rootScope.$new();

        // Fetching $location
        testApp.run(($rootScope, $location) => {
            $rootScope.location = $location;
        });

        boardViewControllerTest = $controller("BoardViewController", {
            $scope: $scope,
            $route: $rootScope,
            $location: $rootScope.location,
            $sce: $sce,
            boardsService: boardsService,
            cardsService: cardsService
        });

        //boardViewControllerTest.$route.current.params.boardId = "boardId";


        // intercept operation "this.deletedFolders = await this.getDeletedFolders();" $onInit()
        boardViewControllerTest.boardsService.getBoardsByIds = jest.fn()
            .mockImplementation(() => {
                return Promise.resolve({
                    all: [],
                    page: 0,
                    pageCount: 0
                });
            });

        // intercept operation "await this.getBoards();" $onInit()
        boardViewControllerTest.cardsService.getAllCardsByBoard = jest.fn()
            .mockImplementation(() => {
                return Promise.resolve({
                    all: [],
                    page: 0,
                    pageCount: 0
                });
            });


        //boardViewControllerTest.$onInit();
    });

    it("test resetCards", (done) => {
        boardViewControllerTest.filter = {
            page: 1,
            boardId: "boardId"
        };
        boardViewControllerTest.cards = [{
            _id: "id",
            title: "title",
            description: "description",
            imageUrl: "imageUrl",
            modificationDate: "modificationDate"
        }];

        boardViewControllerTest.resetCards();

        expect(boardViewControllerTest.cards).toEqual([]);
        expect(boardViewControllerTest.filter.page).toEqual(0);
        done();
    });

    it("test openDeleteResourceLightbox", (done) => {
        boardViewControllerTest.displayDeleteCardLightbox = false;
        boardViewControllerTest.openDeleteResourceLightbox(card);
        expect(boardViewControllerTest.selectedCard).toEqual(card);
        expect(boardViewControllerTest.displayDeleteCardLightbox).toEqual(true);
        done();
    });

    it("test openPreviewResourceLightbox", (done) => {
        boardViewControllerTest.displayPreviewCardLightbox = false;
        boardViewControllerTest.openPreviewResourceLightbox(card);
        expect(boardViewControllerTest.selectedCard).toEqual(card);
        expect(boardViewControllerTest.displayPreviewCardLightbox).toEqual(true);
        done();
    });

    it("test openEditResourceLightbox", (done) => {
        boardViewControllerTest.cardForm = new CardForm();
        boardViewControllerTest.displayUpdateCardLightbox = false;
        boardViewControllerTest.displayCardLightbox = false;
        boardViewControllerTest.openEditResourceLightbox(card);
        expect(boardViewControllerTest.cardForm._id).toEqual(card.id);
        expect(boardViewControllerTest.cardForm.title).toEqual(card.title);
        expect(boardViewControllerTest.cardForm.description).toEqual(card.description);
        expect(boardViewControllerTest.cardForm.caption).toEqual(card.caption);
        expect(boardViewControllerTest.cardForm.resourceId).toEqual(card.resourceId);
        expect(boardViewControllerTest.cardForm.resourceType).toEqual(card.resourceType);
        expect(boardViewControllerTest.cardForm.resourceUrl).toEqual(card.resourceUrl);
        expect(boardViewControllerTest.cardForm.boardId).toEqual(card.boardId);
        expect(boardViewControllerTest.cardForm.sectionId).toEqual(null);
        expect(boardViewControllerTest.displayUpdateCardLightbox).toEqual(true);
        expect(boardViewControllerTest.displayCardLightbox).toEqual(true);
        done();
    });


});