import { angular, ng, http, $ } from 'entcore';
import { Subject, Observable } from "rxjs";
import moment = require('moment');
import {RootsConst} from "../../core/constants/roots.const";
import { IOnChangesObject } from 'angular';
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController {
    nextPage(): void;

    openPage(): void;

    previousPage(): void;

    keyNav(e: JQueryKeyEventObject): void;
    loadPdfJs(): Promise<void> ;
    pageIndex: number | any;
    numPages: number;
    loading: boolean;
    reloadPdf: Subject<number>;
}

interface IPdfViewerProps {
    ngSrc: string ;
}

interface IPdfViewerScope extends IViewModel, IPdfViewerProps {
    vm: IViewModel;
}

let _loadedPdfJs = false;



class Controller implements IViewModel {
    pageIndex: number | any;
    numPages: number;
    loading: boolean;
    reloadPdf: Subject<number>;
    constructor(private $scope: IPdfViewerScope, element: ng.IAugmentedJQuery) {
        this.loading = true;
        this.pageIndex = 1;
        this.reloadPdf = new Subject<number>();
    }

    $onInit() {
    }

    $onDestroy() {
        document.removeEventListener("keydown", this.keyNav);
    }

    nextPage = (): void => {
        if (this.pageIndex < this.numPages) {
            this.pageIndex++;
            this.openPage();
        }
    }

    openPage = (): void => {
        var pageNumber = parseInt(this.pageIndex);
        if (!pageNumber) {
            return;
        }
        if (pageNumber < 1) {
            pageNumber = 1;
        }
        if (pageNumber > this.numPages) {
            pageNumber = this.numPages;
        }
        this.reloadPdf.next(pageNumber)
    }

    previousPage = (): void => {
        if (this.pageIndex > 1) {
            this.pageIndex--;
            this.openPage();
        }
    }
    keyNav = function(e)
    {
        switch(e.keyCode)
        {
            case 37: this.previousPage(); break;
            case 39: this.nextPage(); break;
        }
        safeApply(this);
    };

    loadPdfJs(): Promise<void> {
        if (_loadedPdfJs) return Promise.resolve();
        (window as any).PDFJS = {workerSrc: '/infra/public/js/viewers/pdf.js/pdf.worker.js'};
        return http().loadScript('/infra/public/js/viewers/pdf.js/pdf.js').then(e => {
            _loadedPdfJs = true;
            return e;
        })
    }
};


function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}pdf-viewer/pdf-viewer.html`,
        scope: {
                ngSrc: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IPdfViewerScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            this.element = angular.element(element);
            document.addEventListener("keydown", this.keyNav);

            var canvas = document.createElement('canvas');
            $(canvas).addClass('render');
            this.element.append(canvas);
            $scope.vm.loadPdfJs().then(() => {
                (window as any).PDFJS
                    .getDocument(attrs.ngSrc)
                    .then(function (file) {
                        vm.pdf = file;
                        console.log(vm.pdf)
                        vm.numPages = vm.pdf.pdfInfo.numPages;
                        $scope.$apply('numPages');
                        vm.openPage();
                        vm.loading = false;
                        $scope.$apply('loading');
                    }).catch(function(e){
                     console.log(e)
                    vm.loading = false;
                    $scope.$apply('loading');
                })
            });

            (vm.reloadPdf as Observable<number>).debounceTime(100).subscribe(pageNumber=>{
                vm.pdf.getPage(pageNumber).then(function (page) {
                    var viewport;
                    if (!$(canvas).hasClass('fullscreen')) {
                        viewport = page.getViewport(1);
                        var scale = element.width() / viewport.width;
                        viewport = page.getViewport(scale);
                    }
                    else {
                        viewport = page.getViewport(2);
                    }

                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    page.render(renderContext);
                });
            })
        }
    }
}

export const pdfViewerNew = ng.directive('pdfViewer', directive)