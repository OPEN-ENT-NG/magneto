import {ng} from "entcore";

function directive() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
}
export const onErrorSrc = ng.directive('onErrorSrc', directive)