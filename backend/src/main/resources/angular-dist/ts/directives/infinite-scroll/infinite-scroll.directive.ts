import {IScope} from "angular";
import {angular, ng} from "entcore";
import {InfiniteScrollService} from "../../shared/services";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IScrollProps {
    scroll(): Promise<void>;

    loading: boolean;
}

interface IScrollProps {
    scrolled(): void;

    loadingMode: boolean;
    querySelector: string;
    isHorizontal: boolean;
    scrollEventer: InfiniteScrollService;
}

interface IScrollScope extends IScope, IScrollProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    loading: boolean;
    loadingMode: boolean;
    querySelector: string;
    isHorizontal: boolean;


    scrollEventer: InfiniteScrollService;

    private currentscrollSize: number = 0;
    // latest height once scroll will reach
    private latestSize: number = 300;

    scrolled: () => void;

    constructor(private $scope: IScrollScope) {

    }

    $onInit = () => {
        this.loading = false;
        // If somewhere in your controller you have to reinitialise anything that should "reset" your dom height
        // We reset currentscrollSize
        this.scrollEventer.getInfiniteScroll().subscribe(() => this.currentscrollSize = 0);
        if (!!this.querySelector)
            this.latestSize = this.isHorizontal ? 450 : 150;
    };

    scroll = async (): Promise<void> => {
        let scrollSize: number;
        let scrollPos: number;

        if (!!this.querySelector && angular.element(document.querySelector(this.querySelector)).length > 0) {
            if (this.isHorizontal) {
                scrollSize = angular.element(document.querySelector(this.querySelector))[0].scrollWidth as number;
                scrollPos = Math.floor(angular.element(document.querySelector(this.querySelector)).width() + angular.element(document.querySelector(this.querySelector)).scrollLeft());
            } else {
                scrollSize = angular.element(document.querySelector(this.querySelector))[0].scrollHeight as number;
                scrollPos = Math.floor(angular.element(document.querySelector(this.querySelector)).height() + angular.element(document.querySelector(this.querySelector)).scrollTop());
            }
        } else {
            scrollSize = $(document).height() as number;
            scrollPos = Math.floor($(window).height() + $(window).scrollTop());
        }


        const isEnd: boolean = scrollSize - this.latestSize < scrollPos;

        if (isEnd && this.currentscrollSize < scrollSize) {
            if (this.loadingMode) this.loading = true;
            await this.scrolled();
            if (this.loadingMode) this.loading = false;
            // Storing the latest scroll that has been the longest one in order to not redo the scrolled() each time
            this.currentscrollSize = scrollSize;
        }
    }

    $onDestroy = () => {
        !!this.querySelector ? $(this.querySelector) : $(window).off("scroll");
    };

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}infinite-scroll/infinite-scroll.html`,
        scope: {
            scrolled: '&',
            querySelector: '=?',
            loadingMode: '=?',
            isHorizontal: '=?',
            scrollEventer: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function (scope: IScrollScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {

            angular.element(document).ready(async function () {
                await vm.scroll();
                setScrollEvent(!!vm.querySelector ? $(vm.querySelector) : $(window));
            });

            function setScrollEvent(elem: JQuery): void {
                elem.scroll(async () => {
                    await vm.scroll();
                });
            }
        }
    }
}

export const infiniteScroll = ng.directive('infiniteScroll', directive)