import { ng, Behaviours ,workspace} from 'entcore';
import {CsvController, CsvDelegate, CsvFile} from './csv-viewer/csv-viewer.directive';
import {TxtController, TxtDelegate, TxtFile} from './txt-viewer/txt-viewer-directive';
import {RootsConst} from "../../core/constants/roots.const";
import {ILocationService, IScope, IWindowService} from "angular";
import {safeApply} from "../../utils/safe-apply.utils";
import {FileViewModel} from "./FileViewerModel";
import {hasRight} from "../../utils/rights.utils";
import {workspaceService} from "../../services";

const workspaceServiceV2 = workspace.v2.service;

interface IViewModel extends ng.IController , IFileViewerProps{
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
    $parent: {
        display: {
            editedImage: any;
            editImage: boolean;
        }
    }
    htmlContent: string;
    download(): void;
    canDownload(): boolean;
    edit(): void;
    canEdit(): boolean;
    hasRight: typeof hasRight;
}

interface IFileViewerProps {
    file: FileViewModel;
    contentType: string;
    hasDownload: boolean;
    hasEdit: boolean;
}

interface IFileViewerScope extends IScope, IFileViewerProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    contentType: string;

    hasDownload: boolean;
    hasEdit: boolean;

    hasEditRight: boolean = false;
    file: FileViewModel;

    hasRight: typeof hasRight = hasRight;
    constructor(private $scope: IFileViewerScope,
                private $location: ILocationService,
                private $sce: ng.ISCEService,
                private $window: IWindowService){
        this.$scope = $scope;
        //Necessaire pour refresh la directive en cas de même type de fichier
        $scope.$watch('vm.file', (newVal, oldVal) => {
            this.contentType = "refresh"
            workspaceService.canEditDocument(this.file._id).then((canEditRight: boolean) => {
                this.hasEditRight = canEditRight;
                safeApply(this.$scope);
            }).catch(() => {
                this.hasEditRight = false;
            });
            safeApply($scope)
        });
    }
    $onInit() {
        Behaviours.load('lool').then(() => {
            Behaviours.applicationsBehaviours.lool.init(() => console.debug("Lool behaviours loaded"));
        });

        workspaceService.canEditDocument(this.file._id).then((canEditRight: boolean) => {
            this.hasEditRight = canEditRight;
            safeApply(this.$scope);
        }).catch(() => {
            this.hasEditRight = false;
        });

    }


    isFullscreen = false;

    download = function () {
        window.open(`/workspace/document/${this.file._id}`);
    };
    canDownload = () => {
        return this.hasDownload && workspaceServiceV2.isActionAvailable("download", [this.file])
    }

    edit = (): void => {
        Behaviours.applicationsBehaviours['lool'].openOnLool(this.file);
    };
    canEdit = (): boolean => {
        const ext: string[] = ['doc', 'ppt', "xls"];
        const isoffice: boolean = ext.includes(this.contentType);
        const canBeOpenOnLool: boolean = !Behaviours.applicationsBehaviours['lool'].failed && Behaviours.applicationsBehaviours['lool'].canBeOpenOnLool(this.file);

        return this.hasEditRight && this.hasEdit && isoffice && canBeOpenOnLool;
    }

    isOfficePdf = () => {
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
            && this.file[0]
            && this.file[0].metadata
            && typeof this.file[0].metadata.captation === "boolean";
    }
    previewUrl = () => {
        return `/workspace/document/preview/${this.file._id}`;
    }


    $parent: { display: { editedImage: any; editImage: boolean } };
    csvDelegate: CsvDelegate;
    htmlContent: string;
    txtDelegate: TxtDelegate;

    getCsvContent(): CsvDelegate {
        return undefined;
    }
}
class CsvProviderFromText implements CsvFile {
    private _cache: Promise<string>;
    constructor(private model: FileViewModel) { }
    get id() { return this.model._id; }
    get content() {
        if (this._cache) return this._cache;
        this._cache = new Promise<string>(async (resolve, reject) => {
            const a = await workspaceServiceV2.getDocumentBlob(this.model._id);
            const reader = new FileReader();
            reader.onload = () => {
                const res = (reader.result) as string;
                resolve(res);
            }
            reader.onerror = (e) => reject(e);
            reader.readAsText(a);
        })
        return this._cache;
    }
}
class CsvProviderFromExcel implements CsvFile {
    private _cache: Promise<string>;
    constructor(private model: workspace.v2.models.Element) { }
    get id() { return this.model._id; }
    get content() {
        if (this._cache) return this._cache;
        this._cache = new Promise<string>(async (resolve, reject) => {
            const a = await workspaceServiceV2.getPreviewBlob(this.model._id);
            const reader = new FileReader();
            reader.onload = () => {
                const res = (reader.result) as string;
                resolve(res);
            }
            reader.onerror = (e) => reject(e);
            reader.readAsText(a);
        })
        return this._cache;
    }
}
function directive(){
    return {
        restrict: 'E',
        scope: {
            file: '=',
            contentType: '=',
            hasDownload: '=',
            hasEdit: '='
        },
        replace:true,
        templateUrl: `${RootsConst.directive}/file-viewer/file-viewer.html`,
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', Controller],
        /* interaction DOM/element */
        link: function (scope: IViewModel, element, attributes) {
            const _csvCache: { [key: string]: CsvFile } = {}
            const _txtCache: { [key: string]: TxtFile } = {}
            let _csvController: CsvController = null;
            let _txtDelegate: TxtController = null;
            scope.csvDelegate = {
                onInit(ctrl) {
                    _csvController = ctrl;
                    _csvController.setContent(getCsvContent());
                }
            }
            scope.txtDelegate = {
                onInit(ctrl) {
                    _txtDelegate = ctrl;
                    _txtDelegate.setContent(getTxtContent())
                }
            }
            const getCsvContent = () => {
                if (_csvCache[scope.vm.file._id]) {
                    return _csvCache[scope.vm.file._id];
                }
                if (scope.vm.contentType == "csv") {
                    _csvCache[scope.vm.file._id] = new CsvProviderFromText(scope.vm.file);
                } else {
                    _csvCache[scope.vm.file._id] = new CsvProviderFromExcel(scope.vm.file);
                }
                return _csvCache[scope.vm.file._id];
            }
            const getTxtContent = () => {
                if (_txtCache[scope.vm.file._id]) {
                    return _txtCache[scope.vm.file._id];
                }
                _txtCache[scope.vm.file._id] = new CsvProviderFromText(scope.vm.file);
                return _txtCache[scope.vm.file._id];
            }

            if (scope.contentType == 'html') {
                const call = async () => {
                    const a = await workspaceServiceV2.getDocumentBlob(scope.vm.file._id);
                    const reader = new FileReader();
                    reader.onload = function () {
                        safeApply(scope);
                    }
                    reader.readAsText(a);
                }
                call();
            }
        }
    }
}

export const fileViewer = ng.directive('fileViewer', directive)
