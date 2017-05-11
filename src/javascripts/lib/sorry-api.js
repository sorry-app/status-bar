/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function(w) { "use strict";

	/*
	 * Load in an dependancies required by this plugin.
	 *
	 * These are pulled inline by the Browserify package ready for
	 * distribution, and properly scopes and namespaced for safety.
	 */
	// Cross-Domain AJAX Support for jQuery in IE 8/9.
	var $ = require('jquery');
	// Cross-Domain AJAX Support for jQuery in IE 8/9.
	var legacy_cors_support = require('jquery-ajax-transport-xdomainrequest');

	/*
	 *
	 * Sorry API Client
	 *
	 * Allows basic REST based acess to the Sorry API to gather details
	 * about the page such as it's brand settings and any notices which
	 * happen to be list on the page.
	 *
	 */

	var SorryAPI = function(options) {
		// Quick self refernce to the class.
		var self = this;

		// Cache options into the class.
		// Merge in options from the defaults, followed by
		// the window object and the local hash if passed.
		self.options = $.extend({}, SorryAPI.DEFAULTS, window.SorryAPIOptions, options);
	};

	SorryAPI.DEFAULTS = {
		host: '//ro-api.sorryapp.com', // IMPORTANT: Must be schemless for cross-browser AJAX support.
		version: 1
	};

	// Provide an easy accessor for the endpoint URL.
	SorryAPI.prototype.endpoint_url = function() {
		// Reference self again.
		var self = this;

		// Compile the endpoint from the host and version
		// number available in the options.
		// TODO Cater for inproperly formatted hosts and version numbrs.
		return self.options.host + '/v' + self.options.version;
	};

	// TODO: Add support for success/fail behaviour.
	SorryAPI.prototype.fetchPage = function(page_id, includes, filters, callback) {
		// Reference self again.
		var self = this;

		// Compile the target URL from the parameters.
		var target_url = self.endpoint_url() + '/pages/' + page_id;

		// Make a JSON request to acquire any notices to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: target_url,
			// Set headers using beforeSend as headers: isn't supported in older jQuery.
			beforeSend: function(xhr) { xhr.setRequestHeader('X-Plugin-Ping', 'status-bar'); },
			// Request some additional parameters, and pass subscriber data.
			data: { 
				include: includes.join(','), // Get brand and notices in a single package.
				filter: filters, // Include filters on the request.
				subscriber: self.options.subscriber // Pass optional subscriber configured in the client.
			},
			// Handle the response after JSON returned.
			success: callback
		});
	};

	// commonjs
	if( typeof exports !== "undefined" ){
		exports.SorryAPI = SorryAPI;
	}
	else {
		w.SorryAPI = SorryAPI;
	}

})( typeof global !== "undefined" ? global : this );