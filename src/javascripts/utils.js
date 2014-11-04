/* Helpful Utility Methods. */

// Add a last() method to the array class.
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}