import {ng} from 'entcore';
import {Subject} from 'rxjs';
import {RootsConst} from "../../core/constants/roots.const";
import {IScope} from "angular";

interface IViewModel extends ng.IController, IDropzoneOverlayProps {
    visible: boolean;
    error: boolean;
    canDrop: boolean;
    onBeforeShow: Subject<any>;
    onShow: Subject<any>;
    onHide: Subject<any>;
    displayError?(): void;
    showInfo?(): boolean;
    showWarning?(): boolean;
    show?(): void;
    hide?(): void;
    onImport?(files: any): void;
    onCannotDrop?(): void;
    $on?(event: string, listener: Function): void;
    $watch?(watchExpression: string | Function, listener?: Function, objectEquality?: boolean): void;
    StickyDelegate(element: ng.IAugmentedJQuery, attributes: ng.IAttributes): void;
    ResetScrollDelegate(element: ng.IAugmentedJQuery, attributes: ng.IAttributes): void;
}

interface IDropzoneOverlayProps {
    canDrop: boolean;
    activated: boolean;
    onImport?: (files: any) => void;
    onCannotDrop?: () => void;
}

interface IDropzoneOverlayScope extends IScope, IDropzoneOverlayProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    visible: boolean;
    error: boolean;
    canDrop: boolean;
    onBeforeShow: Subject<any>;
    onShow: Subject<any>;
    onHide: Subject<any>;
    activated: boolean;
    onImport?: (files: any) => void;
    onCannotDrop?: () => void;


    constructor(private $scope: IDropzoneOverlayScope,
                private $timeout: ng.ITimeoutService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }


    StickyDelegate = (element: ng.IAugmentedJQuery, attributes: ng.IAttributes): void => {
        if (!attributes.stickyBloc) {
            return;
        }
        let original: number = null;
        let initialOffset: number = null;
        const dropZone: JQuery = element.find(".dropzone-overlay");
        const parent: JQuery = element.parent();
        const move = () => {
            if (original == null) {
                const position: any = dropZone.position()
                original = position.top;
                initialOffset = parent.scrollTop();
            }
            if (attributes.stickyBloc == "top") {
                const offset = parent.scrollTop();
                const newTop = original + offset - initialOffset;
                dropZone.css({top: newTop + "px", "transition": "all 300ms ease-in-out"})
            }
        }
        const bind = () => {
            parent.scroll(move)
        }
        const unbind = () => {
            parent.off("scroll", move)
        }

        bind();
        this.$scope.$on("destroy", unbind)
    }

    ResetScrollDelegate = (element: ng.IAugmentedJQuery, attributes: ng.IAttributes): void => {
        if (!attributes.resetScroll) {
            return;
        }
        const parent: JQuery = element.parent();
        let original: string = null;
        this.onBeforeShow.subscribe(() =>{
            if (original == null) {
                original = parent.css("overflow");
            }
            parent.css({"overflow": "hidden"})
            parent.scrollTop(0);
        })
        this.onHide.subscribe(() =>{
            if (original != null) {
                parent.css({"overflow": original})
            }
        })
    }
}

function directive($timeout: ng.ITimeoutService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onImport: '&',
            onCannotDrop: '&',
            canDrop: '=',
            activated: '='
        },
        templateUrl: `${RootsConst.directive}drag/dropzoneOverlay.html`,
        controller: ['$scope', '$timeout', Controller],
        controllerAs: 'vm',
        bindToController: true,
        link: ($scope: IDropzoneOverlayScope,
               element: ng.IAugmentedJQuery,
               attrs: ng.IAttributes,
               vm: IViewModel) => {
            vm.onShow = new Subject;
            vm.onHide = new Subject;
            vm.onBeforeShow = new Subject

            vm.StickyDelegate(element, attrs)
            vm.ResetScrollDelegate(element, attrs);
            const parent = element.parent();

            $scope.$watch("canDrop", () => {
                if (vm.canDrop === true) {
                    element.removeClass("cursor-notallowed")
                } else if (vm.canDrop === false) {
                    element.addClass("cursor-notallowed")
                }
            })
            vm.hide = () =>{
                $timeout(() =>{
                    vm.visible = false;
                    vm.error = false;
                    parent.removeClass('dropzone-overlay-wrapper');
                    vm.onHide.next()
                })
            }
            vm.show = () => {
                vm.onBeforeShow.next()
                $timeout(() =>{
                    vm.visible = true;
                    parent.addClass('dropzone-overlay-wrapper');
                    vm.onShow.next()
                })
            }
            vm.showInfo = () => {
                return !vm.showWarning();
            }
            vm.showWarning = () => {
                return vm.error;
            }
            vm.displayError = () => {
                $timeout(() => {
                    vm.error = true;
                })
            }
            vm.error = false
            vm.hide();

            parent.on('dragenter', (e) => {
                vm.show();
            });

            parent.on('dragover', (e) => {
                e.preventDefault();
            });

            parent.on('dragleave', (event) => {
                const rect = parent[0].getBoundingClientRect();
                const getXY = function getCursorPosition(event) {
                    let x, y;
                    if (typeof event.clientX === 'undefined') {
                        // try touch screen
                        x = event.pageX + document.documentElement.scrollLeft;
                        y = event.pageY + document.documentElement.scrollTop;
                    } else {
                        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    return {x: x, y: y};
                };
                const e = getXY(event.originalEvent);
                // Check the mouseEvent coordinates are outside the rectangle
                if (e.x > rect.left + rect.width - 1 || e.x < rect.left || e.y > rect.top + rect.height - 1 || e.y < rect.top) {
                    vm.hide()
                }
            });

            parent.on('drop', async (e: any) => {
                e.preventDefault();
                if (vm.canDrop === false) {
                    vm.onCannotDrop && vm.onCannotDrop()
                    vm.hide();
                    return;
                }
                const files: FileList = e.originalEvent.dataTransfer.files;
                if (!files || !files.length) {
                    return;
                }

                let valid = true;
                for (let i = 0, f; f = files[i]; i++) { // iterate in the files dropped
                    if (!f.type && f.size % 4096 == 0) {
                        // it looks like folder
                        valid = false;
                    }
                }
                if (valid) {
                    vm.onImport({
                        '$event': files
                    });
                    vm.hide();
                } else {
                    vm.displayError();
                }
            });
            $scope.$on('$destroy', () => {
                parent.off()
                vm.onHide.unsubscribe()
                vm.onShow.unsubscribe()
            });
        }
    }
}

export const dropzoneOverlay = ng.directive('dropzoneOverlay', directive)
