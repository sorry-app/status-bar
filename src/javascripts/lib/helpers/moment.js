'use strict';

var helpers = module.exports;

/**
 * Use [moment][] as a helper. See [helper-date][] for more details.
 *
 * @exposes helper-date as moment
 * @api public
 */

helpers.moment = helpers.date = require('helper-date');
