/*
 * A mock third-party JavaScript lib to test that the website plugin
 * isn't conflicting with other peoples code.
 */

(function(window, document, undefined) { "use strict";

    /* Generic error message. */
    var error_msg = 'Third-party library error, stack trace should NOT show as from status-bar.js'

    /*
     * Raise a warning/error to ensure that the
     * plugin still runs, and doesn't log the
     * the exception.
     */
    // Console warning.
    console.warn(error_msg);
    
    // Uncaught promise rejections.
    Promise.reject(new Error(error_msg)).then(function(result) {
        // Promise resolved.
        console.log('Promise was resolved');
    }, function(result) {
        // Promise rejected.
        console.log(result);
    });
    
    // Proper exception.
    throw new Error(error_msg);

})(window, document);
