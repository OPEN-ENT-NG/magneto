import { ng, Behaviours ,workspace} from 'entcore';
import { CsvDelegate, CsvFile } from './csv-viewer/csv-viewer.directive';
import { TxtDelegate } from './txt-viewer/txt-viewer-directive';
import {RootsConst} from "../../core/constants/roots.const";
import {ILocationService, IScope, IWindowService} from "angular";

declare var ENABLE_LOOL: boolean;
declare var ENABLE_SCRATCH: boolean;
declare var ENABLE_GGB: boolean;

const workspaceService = workspace.v2.service;

interface IViewModel extends ng.IController , IFileViewerProps{
    contentType: string;
    isFullscreen: boolean;
    csvDelegate: CsvDelegate;
    txtDelegate: TxtDelegate
    isTxt(): boolean
    isStreamable(): boolean
    download(): void;
    isOfficePdf(): boolean;
    isOfficeExcelOrCsv(): boolean;
    getCsvContent(): CsvDelegate;
    render?: () => void;
    previewUrl(): string;
    canEditInLool(): boolean;
    canEditInScratch(): boolean;
    openOnLool(): void;
    openOnScratch(): void;
    openOnGeogebra():void;
    $parent: {
        display: {
            editedImage: any;
            editImage: boolean;
        }
    }
    htmlContent: string;
    download(): void;
    canDownload(): boolean
}

interface IFileViewerProps {
    file: workspace.v2.models.Element;
}

interface IFileViewerScope extends IScope, IFileViewerProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    contentType: string;
    file: workspace.v2.models.Element;
    ENABLE_SCRATCH:boolean = true;
    constructor(private $scope: IFileViewerScope,
                private $location: ILocationService,
                private $sce: ng.ISCEService,
                private $window: IWindowService){
    }
    $onInit() {
        this.contentType = this.file.metadata.extension;
    }

    isFullscreen = false;

    download = function () {
        workspaceService.downloadFiles([this.file]);
    };
    canDownload = () => {
        return workspaceService.isActionAvailable("download", [this.file])
    }

    isOfficePdf = () => {
        console.log("isOfficePdf")
        const ext = ['doc', 'ppt'];
        return ext.includes(this.contentType);
    }

    isOfficeExcelOrCsv = () => {
        const ext = ['xls', 'csv'];
        return ext.includes(this.contentType);

    }

    isTxt = () => {
        const ext = ['txt'];
        return ext.includes(this.contentType);
    }

    isStreamable = () => {
        return this.contentType==='video'
            && this.file
            && this.file.metadata
            && typeof this.file.metadata.captation === "boolean";
    }
    previewUrl = () => {
        return this.$scope.vm.file.previewUrl;
    }



    openOnLool = () => {
        ENABLE_LOOL && Behaviours.applicationsBehaviours.lool.openOnLool(this.file);
    }

    openOnScratch = () => {
        ENABLE_SCRATCH && window.open(`/scratch/open?ent_id=${this.file._id}`);
    }

    openOnGeogebra = () => {
        ENABLE_GGB && window.open(`/geogebra#/${this.file._id}?fileName=${this.file.name}.ggb`);
    }

    canEditInLool = () => {
        const ext = ['doc', 'ppt', "xls"];
        const isoffice = ext.includes(this.contentType);
        return isoffice && ENABLE_LOOL && Behaviours.applicationsBehaviours.lool.canBeOpenOnLool(this.file);
    }

    canEditInScratch = () => {
        return ENABLE_SCRATCH &&
            ["sb","sb2","sb3"].includes(this.file.metadata.extension) &&
            this.file.metadata["content-type"] === "application/octet-stream";
    }
    $parent: { display: { editedImage: any; editImage: boolean } };
    csvDelegate: CsvDelegate;
    htmlContent: string;
    txtDelegate: TxtDelegate;

    getCsvContent(): CsvDelegate {
        return undefined;
    }
}
// class CsvProviderFromText implements CsvFile {
//     private _cache: Promise<string>;
//     constructor(private model: workspace.v2.models.Element) { }
//     get id() { return this.model._id; }
//     get content() {
//         if (this._cache) return this._cache;
//         this._cache = new Promise<string>(async (resolve, reject) => {
//             const a = await workspaceService.getDocumentBlob(this.model._id);
//             const reader = new FileReader();
//             reader.onload = () => {
//                 const res = (reader.result) as string;
//                 resolve(res);
//             }
//             reader.onerror = (e) => reject(e);
//             reader.readAsText(a);
//         })
//         return this._cache;
//     }
// }
// class CsvProviderFromExcel implements CsvFile {
//     private _cache: Promise<string>;
//     constructor(private model: workspace.v2.models.Element) { }
//     get id() { return this.model._id; }
//     get content() {
//         if (this._cache) return this._cache;
//         this._cache = new Promise<string>(async (resolve, reject) => {
//             const a = await workspaceService.getPreviewBlob(this.model._id);
//             const reader = new FileReader();
//             reader.onload = () => {
//                 const res = (reader.result) as string;
//                 resolve(res);
//             }
//             reader.onerror = (e) => reject(e);
//             reader.readAsText(a);
//         })
//         return this._cache;
//     }
// }
function directive(){
    return {
        restrict: 'E',
        scope: {
            file: '='
        },
        templateUrl: `${RootsConst.directive}/file-viewer/file-viewer.html`,
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFileViewerScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {}

        // link: function (scope: IViewModel, element, attributes) {
        //     // const _csvCache: { [key: string]: CsvFile } = {}
        //     // const _txtCache: { [key: string]: TxtFile } = {}
        //     // let _csvController: CsvController = null;
        //     // let _txtDelegate: TxtController = null;
        //     // scope.csvDelegate = {
        //     //     onInit(ctrl) {
        //     //         _csvController = ctrl;
        //     //         _csvController.setContent(getCsvContent());
        //     //     }
        //     // }
        //     // scope.txtDelegate = {
        //     //     onInit(ctrl) {
        //     //         _txtDelegate = ctrl;
        //     //         _txtDelegate.setContent(getTxtContent())
        //     //     }
        //     // }
        //     // const getCsvContent = () => {
        //     //     if (_csvCache[scope.file._id]) {
        //     //         return _csvCache[scope.file._id];
        //     //     }
        //     //     if (scope.contentType == "csv") {
        //     //         _csvCache[scope.file._id] = new CsvProviderFromText(scope.file);
        //     //     } else {
        //     //         _csvCache[scope.file._id] = new CsvProviderFromExcel(scope.file);
        //     //     }
        //     //     return _csvCache[scope.file._id];
        //     // }
        //     // const getTxtContent = () => {
        //     //     if (_txtCache[scope.file._id]) {
        //     //         return _txtCache[scope.file._id];
        //     //     }
        //     //     _txtCache[scope.file._id] = new CsvProviderFromText(scope.file);
        //     //     return _txtCache[scope.file._id];
        //     // }
        //     //
        //     // if (scope.contentType == 'html') {
        //     //     const call = async () => {
        //     //         const a = await workspaceService.getDocumentBlob(scope.file._id);
        //     //         const reader = new FileReader();
        //     //         reader.onload = function () {
        //     //             scope.htmlContent = $sce.trustAsHtml(reader.result) as string;
        //     //             safeApply(scope);
        //     //         }
        //     //         reader.readAsText(a);
        //     //     }
        //     //     call();
        //     // }
        // }
    }
}

export const fileViewer = ng.directive('fileViewer', directive)
