import {angular, Document, idiom as lang, ng, notify, toasts, workspace} from "entcore";
import {IScope, IWindowService} from "angular";
import {IBoardsService, ICardsService, ISectionsService, sectionsService} from "../services";
import {create} from 'sortablejs';

import {
    Board,
    BoardForm,
    Boards,
    Card,
    CardForm,
    Cards,
    ICardsParamsRequest,
    ICardsSectionParamsRequest,
    ILinkerParams,
    IMetadata,
    Section,
    SectionForm,
    Sections
} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../shared/services";
import {EventBusService} from "../shared/event-bus-service/event-bus-sockjs.service";
import {RESOURCE_TYPE} from "../core/enums/resource-type.enum";
import {LAYOUT_TYPE} from "../core/enums/layout-type.enum";
import {Draggable} from "../models/draggable.model";
import {WorkspaceUtils} from "../utils/workspace.utils";
import {Subject} from "rxjs";
import {COLLECTION_NAVBAR_VIEWS} from "../core/enums/collection-navbar.enum";


declare const window: any;
interface IViewModel extends ng.IController {

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;
    displayTransferCardLightbox: boolean;
    displayTransferDuplicateCardLightbox: boolean;
    displayPreviewCardLightbox: boolean;
    displayMediaLibraryLightbox: boolean;
    displayAudioMediaLibraryLightbox: boolean;
    displayBoardPropertiesLightbox: boolean;
    displayCollectionLightbox: boolean;
    displayLinkerLightbox: boolean;
    displayVideoResourceLightbox: boolean

    cardForm: CardForm;
    selectedCard: Card;

    videoUrl: string;

    cards: Array<Card>;
    board: Board;
    boardForm: BoardForm;

    filter: {
        page: number,
        boardId: string
    };

    isLoading: boolean;

    isDraggable: boolean;


    nestedSortables: any[];

    infiniteScrollService: InfiniteScrollService;
    cardUpdateSubject: Subject<void>;
    COLLECTION_NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;
    navbarCollection: Array<COLLECTION_NAVBAR_VIEWS>;

    showReadMoreLink: boolean;

    boardDescriptionEventer: Subject<void>;

    updateFrequency: number;

    zoomLevel:  number;
    zoomEventer :Subject<void>;

    goToBoards(): void;

    getCards(): Promise<void>;

    refreshCardsFavoriteNb(): Promise<void>;

    openAddResourceLightbox(resourceType: RESOURCE_TYPE): void;

    openEditResourceLightbox(card: Card): void;

    openLockResource(card: Card): void;

    openReading(): void;

    onFormSubmit(): Promise<void>;

    onBoardFormSubmit(): Promise<void>;

    resetBoardView(): Promise<void>;

    notEmptyAndLayoutFree(): boolean;

    onScroll(): void;

    resetCards(): void;

    onFileSelected(file: any): Promise<void>;

    onVideoSelected(videoHtml: string): void;

    onLinkSubmit(form: { url: "", title: "" }): void;

    getMediaLibraryFileFormat(): string;

    openBoardPropertiesForm(): void;

    onEndDragAndDrop(evt: any): Promise<void>;

    initDraggable(): void;
}

interface IBoardViewScope extends IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {

    private eventBusService: EventBusService;
    zoomEventer :Subject<void> = new Subject<void>();

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;
    displayTransferCardLightbox: boolean;
    displayTransferDuplicateCardLightbox: boolean;
    displayPreviewCardLightbox: boolean;

    cards: Array<Card>;
    board: Board;
    boardForm: BoardForm;
    displayMediaLibraryLightbox: boolean;
    displayCollectionLightbox: boolean;
    displayAudioMediaLibraryLightbox: boolean;
    displayVideoResourceLightbox: boolean;

    displayBoardPropertiesLightbox: boolean;
    displayLinkerLightbox: boolean;

    selectedCard: Card;
    cardForm: CardForm;

    videoUrl: string;

    isLoading: boolean;

    isDraggable: boolean;

    nestedSortables: any[];
    draggable: Draggable;

    filter: {
        page: number,
        boardId: string;
    };

    infiniteScrollService: InfiniteScrollService;
    COLLECTION_NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;
    navbarCollection: Array<COLLECTION_NAVBAR_VIEWS>;
    cardUpdateSubject: Subject<void>;
    showReadMoreLink: boolean;
    boardDescriptionEventer: Subject<void>;

    updateFrequency: number;

    updateIntervalPromise: angular.IPromise<any>;

    zoomLevel:number;
    constructor(private $scope: IBoardViewScope,
                private $route: any,
                private $location: ng.ILocationService,
                private $sce: ng.ISCEService,
                private $timeout: ng.ITimeoutService,
                private $window: IWindowService,
                private $interval: ng.IIntervalService,
                private sectionsServices: ISectionsService,
                private boardsService: IBoardsService,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
        this.infiniteScrollService = new InfiniteScrollService;
        this.cardUpdateSubject = new Subject<void>();
        this.navbarCollection = [];
        this.COLLECTION_NAVBAR_VIEWS = COLLECTION_NAVBAR_VIEWS;
        this.boardDescriptionEventer = new Subject<void>();
        this.zoomLevel = 100;
    }

    async $onInit(): Promise<void> {
        this.initResizeScroll();
        this.displayCardLightbox = false;
        this.displayDeleteCardLightbox = false;
        this.displayTransferCardLightbox = false;
        this.displayTransferDuplicateCardLightbox = false;
        this.displayMediaLibraryLightbox = false;
        this.displayCollectionLightbox = false;
        this.displayVideoResourceLightbox = false;
        this.$window.scrollTo(0, 0);

        this.displayBoardPropertiesLightbox = false;
        this.displayLinkerLightbox = false;
        this.displayPreviewCardLightbox = false;

        this.cards = [];
        this.board = new Board();

        this.boardForm = new BoardForm();
        this.cardForm = new CardForm();
        this.selectedCard = new Card();

        this.filter = {
            page: 0,
            boardId: (this.$route.current && this.$route.current.params) ? this.$route.current.params.boardId : null
        };

        for (const value in COLLECTION_NAVBAR_VIEWS) {
            this.navbarCollection.push(COLLECTION_NAVBAR_VIEWS[value] as COLLECTION_NAVBAR_VIEWS);
        }

        this.isLoading = true;
        this.isDraggable = true;
        this.nestedSortables = [];
        this.showReadMoreLink = false;
        this.initDraggable();


        this.getBoard().then(async () => {
            if (this.board && this.board.layoutType == LAYOUT_TYPE.FREE) {
                await this.getCards();
            }
        });

        this.updateFrequency = parseInt(`${window.magnetoUpdateFrequency}`);
        if (Number.isSafeInteger(this.updateFrequency)) {
            this.updateIntervalPromise = this.$interval(async (): Promise<void> => {
                await this.refreshCardsFavoriteNb();
            }, this.updateFrequency, 0, false);
        }

    }

    /**
     * Go to boards page (Magneto main page)
     */
    goToBoards(): void {
        this.$location.path(`/boards`);
    }

    /**
     * Open the add resource lightbox
     * @param resourceType the type of resource to add
     */
    openAddResourceLightbox = (resourceType: RESOURCE_TYPE): void => {
        this.cardForm = new CardForm();
        this.cardForm.resourceType = resourceType;
        this.displayUpdateCardLightbox = false;

        switch (resourceType) {
            case RESOURCE_TYPE.IMAGE:
                this.displayMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.VIDEO:
                this.displayVideoResourceLightbox = true;
                break;
            case RESOURCE_TYPE.FILE:
                this.displayMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.TEXT:
                this.displayCardLightbox = true;
                break;
            case RESOURCE_TYPE.AUDIO:
                this.displayAudioMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.LINK:
                this.displayLinkerLightbox = true;
                break;
            case RESOURCE_TYPE.CARD:
                this.displayCollectionLightbox = true;
                break;
        }
    }

    /**
     * Open reading board page
     */
    openReading = (): void => {
        this.$location.path(`/board/view/reading/${this.board.id}`);
    }

    /**
     * Open card edition form.
     */
    openEditResourceLightbox = (card: Card): void => {
        this.cardForm = new CardForm().build(card);
        this.cardForm.resourceFileName = card.metadata ? card.metadata.filename : '';
        this.displayUpdateCardLightbox = true;
        this.displayCardLightbox = true;
    }

    /**
     * Open card edition form.
     */
    openPreviewResourceLightbox = (card: Card): void => {
        this.selectedCard = card;
        this.displayPreviewCardLightbox = true;
    }

    /**
     * Open card deletion lightbox.
     */
    openDeleteResourceLightbox = (card: Card): void => {
        this.selectedCard = card;
        this.displayDeleteCardLightbox = true;
    }

    /**
     * Open card lock.
     */
    openLockResource = async (card: Card): Promise<void> => {
        this.cardForm = new CardForm().build(card);
        this.cardForm.locked = !this.cardForm.locked;
        await this.cardsService.updateCard(this.cardForm);
        await this.onFormSubmit();
    }

    /**
     * Open card move lightbox.
     */
    openTransferResourceLightbox = (card: Card): void => {
        this.cardForm = new CardForm().build(card);
        this.displayTransferCardLightbox = true;
    }

    /**
     * Open card duplicate and move lightbox.
     */
    openTransferDuplicateResourceLightbox = (card: Card): void => {
        this.cardForm = new CardForm().build(card);
        this.displayTransferDuplicateCardLightbox = true;
    }

    /**
     * Callback on form submit:
     * - refresh cards and hide lightbox
     */
    onFormSubmit = async (): Promise<void> => {
        this.displayMediaLibraryLightbox = false;
        await this.resetBoardView()
    }

    /**
     * Callback on form submit:
     * - refresh all cards from board
     */
    resetBoardView = async (): Promise<void> => {
        this.resetCards();
        await Promise.all([this.getCards(), this.getBoard()]);
        safeApply(this.$scope);
    }

    notEmptyAndLayoutFree(): boolean {
        return this.cards.length > 0 && this.board.isLayoutFree();
    }

    initDraggable = (): void => {
        const that = this;
        this.draggable = {
            dragHoverHandler(event: DragEvent): void {
                event.preventDefault();
            },
            async dragDropFilesHandler(files: FileList): Promise<void> {
                workspace.v2.service.createDocument(files[0], new Document(), null,
                    {visibility: "protected", application: "media-library"})
                    .then(async result => {
                        if (!!result) {
                            that.cardForm = new CardForm();
                            that.cardForm.resourceType = WorkspaceUtils.getExtension(<IMetadata>result.metadata);
                            that.displayUpdateCardLightbox = false;

                            switch (that.cardForm.resourceType) {
                                case RESOURCE_TYPE.IMAGE:
                                    await that.onFileSelected(result);
                                    break;
                                case RESOURCE_TYPE.VIDEO:
                                    that.videoUrl = result.link;
                                    that.cardForm.resourceFileName = result.metadata.filename;
                                    that.onVideoSelected();
                                    break;
                                case RESOURCE_TYPE.AUDIO:
                                    await that.onFileSelected(result);
                                    break;
                                default:
                                    that.cardForm.resourceType = RESOURCE_TYPE.FILE;
                                    await that.onFileSelected(result);
                                    break;
                            }
                        } else {
                            toasts.warning('magneto.dropzone.create.error')
                        }
                    });
            }
        };

    }

    initDrag = (): void => {
        if (this.board.myRights.publish !== undefined) {
            // Loop through each nested sortable element for DragAndDrop
            for (let i = 0; i < this.nestedSortables.length; i++) {
                this.nestedSortables[i].destroy();
            }
            this.nestedSortables = [];

            const cardList: NodeListOf<Element> = document.querySelectorAll(".cardDirective-list");
            for (let i = 0; i < cardList.length; i++) {
                this.nestedSortables.push(create(cardList[i], {
                    group: 'nested',
                    animation: 150,
                    delay: 150,
                    forceAutoScrollFallback: true,
                    scroll: true, // or HTMLElement
                    scrollSensitivity: 100, // px, how near the mouse must be to an edge to start scrolling.
                    scrollSpeed: 30, // px*/
                    delayOnTouchOnly: true,
                    onEnd: async (evt) => {
                        await this.onEndDragAndDrop(evt);
                        this.isDraggable = true;
                        safeApply(this.$scope);
                    },
                    onStart: () => {
                        this.isDraggable = false;
                        safeApply(this.$scope);
                    }
                }));
            }

            const sectionList: NodeListOf<Element> = document.querySelectorAll("#section-list");
            for (let i = 0; i < sectionList.length; i++) {
                this.nestedSortables.push(create(sectionList[i], {
                    animation: 300,
                    easing: "cubic-bezier(1, 0, 0, 1)",
                    delay: 150,
                    forceAutoScrollFallback: true,
                    scroll: true, // or HTMLElement
                    scrollSensitivity: 100, // px, how near the mouse must be to an edge to start scrolling.
                    scrollSpeed: 30, // px*/
                    delayOnTouchOnly: true,
                    filter: ".notDraggable",
                    preventOnFilter: false,
                    onUpdate: async (evt) => {
                        let form: BoardForm = new BoardForm().build(this.board);
                        let sectionIds: Array<string> = this.board.sections.map((section: Section) => section.id);
                        let oldSectionId: string = sectionIds[evt.oldIndex];
                        let newSectionIndex: number = evt.newIndex;
                        sectionIds.splice(evt.oldIndex, 1);
                        sectionIds.splice(newSectionIndex, 0, oldSectionId);
                        form.sectionsIds = sectionIds;
                        this.boardsService.updateBoard(this.board.id, form)
                            .then(async res => {
                                if (res.status == 200 || res.status == 201) {
                                    this.board.sections = this.board.sortSections(sectionIds);
                                    this.isDraggable = true;
                                    safeApply(this.$scope);
                                }
                            });
                    },
                    onStart: () => {
                        this.isDraggable = false;
                        safeApply(this.$scope);
                    }
                }));
                safeApply(this.$scope);
            }
        }
    }

    onEndDragAndDrop = async (evt: any): Promise<void> => {
        let newNestedSectionId: string = evt.to.id.replace("section-container-", "");
        if (newNestedSectionId.length > 0) {
            let oldNestedContainerId: string = evt.from.id.replace("section-container-", "");
            let oldSection: Section = oldNestedContainerId ? (this.board.sections.filter(e => e instanceof Section && e.id === oldNestedContainerId)[0]) as Section : null;
            let newSection: Section = newNestedSectionId ? (this.board.sections.filter(e => e instanceof Section && e.id === newNestedSectionId)[0]) as Section : null;

            let movedCardId: string = oldSection.cardIds[evt.oldIndex];
            let newCardIndex: number = evt.newIndex;

            oldSection.cardIds.splice(evt.oldIndex, 1);
            newSection.cardIds.splice(newCardIndex, 0, movedCardId);

            await Promise.all([
                sectionsService.update(new SectionForm().build(oldSection)),
                sectionsService.update(new SectionForm().build(newSection))
            ])
        } else {
            let oldNestedContainerId: string = evt.from.id.replace("section-container-", "");
            let oldSection: Section = oldNestedContainerId ? (this.board.sections.filter(e => e instanceof Section && e.id === oldNestedContainerId)[0]) as Section : null;
            let movedCardId: string = oldSection.cardIds[evt.oldIndex];
            let newSection: SectionForm = new SectionForm().buildNew(this.board.id);
            newSection.addCardId(movedCardId);
            newSection.title = lang.translate("magneto.section.default.title");
            oldSection.cardIds.splice(evt.oldIndex, 1);

            // Remove card from the dom
            const originalElement: any = evt.item;
            originalElement.parentNode.removeChild(originalElement);

            await Promise.all([
                sectionsService.update(new SectionForm().build(oldSection)),
                sectionsService.create(newSection)
            ])
            await this.getBoard();
        }
    };

    /**
     * Init resize listener for adapting height from screen size
     */
    initResizeScroll = (): void => {
        angular.element(window).bind('resize', this.calcHeightSections);
    }

    /**
     * Adapt height from screen size computing
     */
    calcHeightSections = (): void => {
        if(this.board.layoutType == LAYOUT_TYPE.VERTICAL) {
            // Obtenir la largeur actuelle de l'écran
        let screenWidth: number = $(window).width();
            // Calculer la hauteur du header en fonction de la taille d'écran
        let headerHeight: number = screenWidth > 801 ? $('.boardContainer-container-header').outerHeight() : $('.boardContainer-container-header-mobile').outerHeight();
        // Calculer la hauteur de la fenêtre moins la hauteur des autres éléments + 54 correspond au 30 du padding section + 24 du padding header
        let maxHeightContainer: number = $('.navbar').outerHeight() + headerHeight + $('.sections-listDirective-content-container').outerHeight() + 54;
            // Appliquer la nouvelle max-height à votre élément
            $('.cardDirective-list-vertical').css('height', 'calc(100vh - ' + (maxHeightContainer) + 'px)');
        } else {
            $('.sections-listDirective-horizontal').removeAttr('style');
            $('.cardDirective-list-horizontal').removeAttr('style');
        }
    }

    /**
     * Fetch board infos.
     */
    getBoard = async (): Promise<void> => {
        this.isLoading = true;
        return this.boardsService.getBoardsByIds([this.filter.boardId])
            .then(async (res: Boards) => {
                if (!!res) {
                    this.board = res.all[0];
                    if (this.board.layoutType != LAYOUT_TYPE.FREE) {
                        this.sectionsServices.getSectionsByBoard(this.filter.boardId).then(async (sections: Sections) => {
                            this.board.sections = sections.all;
                            await this.getCardsBySectionBoard();
                            setTimeout(this.initDrag, 1000);
                            setTimeout(this.calcHeightSections, 1000);
                        });
                    }
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    /**
     * Fetch board cards.
     */
    getCards = async (): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            page: this.filter.page,
            boardId: this.filter.boardId
        };
        this.cardsService.getAllCardsByBoard(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    res.all.forEach((card: Card) => {
                        const isDuplicate: boolean = this.cards.some((existingCard: Card): boolean => existingCard.id === card.id);
                        if (!isDuplicate) {
                            this.cards.push(card);
                        }
                    });
                    this.cardUpdateSubject.next();
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    refreshCardsFavoriteNb = async (): Promise<void> => {
        const params: ICardsParamsRequest = {
            page: 0,
            boardId: this.filter.boardId,
            fromStartPage: true
        };

        this.cardsService.getAllCardsByBoard(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    res.all.forEach((card: Card) => {
                        const existingCardIndex: number = this.cards.findIndex((existingCard: Card): boolean => existingCard.id === card.id);
                        if (existingCardIndex !== -1) {
                            // Mettre à jour le champ nbOfFavorites de la carte existante
                            this.cards[existingCardIndex].nbOfFavorites = card.nbOfFavorites;
                        }
                    });
                    this.cardUpdateSubject.next();
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    /**
     * Fetch board cards for all sections.
     */
    getCardsBySectionBoard = async (): Promise<void> => {
        let promises: Promise<void>[] = [];
        this.board.sections.forEach((section) => promises.push(this.getCardsBySection(section)));
        await Promise.all(promises);
        safeApply(this.$scope);
    }

    /**
     * Fetch board cards by section.
     */
    getCardsBySection = async (section: Section): Promise<void> => {
        this.isLoading = true;
        const params: ICardsSectionParamsRequest = {
            page: section.page,
            sectionId: section.id
        };

        const cards = await this.cardsService.getAllCardsBySection(params);
        if (!!cards.all && cards.all.length > 0) {
            section.cards.push(...cards.all);
            this.cardUpdateSubject.next();
        }
        this.isLoading = false;
    }

    /**
     * Callback on board properties form submit
     */
    onBoardFormSubmit = async (): Promise<void> => {
        this.displayBoardPropertiesLightbox = false;
        this.getBoard().then(async () => {
            if (this.board.layoutType == LAYOUT_TYPE.FREE) {
                await this.getCards();
            }
            this.boardDescriptionEventer.next();
        });
        safeApply(this.$scope);
    }

    /**
     * Reset cards filter
     */
    resetCards = (): void => {
        this.filter.page = 0;
        this.cards = [];
    }

    /**
     * Callback on media library form submit
     * @param file the card file
     */
    onFileSelected = async (file: any): Promise<void> => {
        this.displayMediaLibraryLightbox = false;
        this.cardForm.title = "";
        this.cardForm.description = "";
        this.cardForm.caption = "";
        this.cardForm.resourceId = file._id;
        this.cardForm.resourceFileName = file.metadata.filename;
        this.cardForm.resource = file;
        this.$timeout(() => {
            this.displayCardLightbox = true;
        }, 100);
    }

    /**
     * Callback on video form submit
     */
    onVideoSelected = (): void => {
        this.displayVideoResourceLightbox = false;

        // Video from workspace
        if (this.videoUrl.includes("workspace")) {
            const regex = /\/workspace\/document\/[a-f0-9-]+/;
            const match = regex.exec(this.videoUrl);
            this.cardForm.resourceUrl = match[0];
        }
        // Video from URL
        else {
            this.cardForm.resourceUrl = this.$sce.trustAsResourceUrl(
                this.videoUrl.split("src=\"")[1].split('"')[0]);
        }

        this.displayCardLightbox = true;
        safeApply(this.$scope);
    }

    /**
     * Callback on link form submit
     * @param form
     */
    onLinkSubmit = (form: ILinkerParams): void => {
        this.cardForm.resourceUrl = this.$sce.trustAsResourceUrl(form.link).toString();
        this.cardForm.title = form.title;
        this.$timeout(() => {
            this.displayCardLightbox = true;
        }, 100);
    }

    /**
     * Get cardForm file format for media library
     */
    getMediaLibraryFileFormat = (): string => {
        switch (this.cardForm.resourceType) {
            case RESOURCE_TYPE.IMAGE:
                return 'img';
            case RESOURCE_TYPE.FILE:
                return 'any';
            default:
                return 'any';
        }
    }

    /**
     * Open board properties form.
     */
    openBoardPropertiesForm = (): void => {
        this.boardForm = new BoardForm().build(this.board);
        this.displayBoardPropertiesLightbox = true;
    }

    $onDestroy() {
        this.$interval.cancel(this.updateIntervalPromise);
    }

    /**
     * Callback on infinite scroll
     */
    onScroll = async (): Promise<void> => {
        if (this.cards.length > 0) {
            this.filter.page++;
            await this.getCards();
        }
    }
}

export const boardViewController = ng.controller('BoardViewController',
    ['$scope', '$route', '$location', '$sce', '$timeout', '$window', '$interval', 'SectionsService', 'BoardsService', 'CardsService', Controller]);
