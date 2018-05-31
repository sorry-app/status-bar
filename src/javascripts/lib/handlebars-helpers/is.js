'use strict';

var util = require('handlebars-utils');

/**
 * Block helper that renders a block if `a` is **equal to** `b`.
 * If an inverse block is specified it will be rendered when falsy.
 * Similar to [eq](#eq) but does not do strict equality.
 *
 * @param {any} `a`
 * @param {any} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

module.exports = function is(a, b, options) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a == b, this, options);
};
