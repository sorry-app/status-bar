/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function($, window, document, undefined) { "use strict";

	/*
	 *
	 * Sorry API Client
	 *
	 * Allows basic REST based acess to the Sorry API to gather details
	 * about the page such as it's brand settings and any notices which
	 * happen to be list on the page.
	 *
	 */

	window.SorryAPI = function(options) {
		// Quick self refernce to the class.
		var self = this;

		// Cache options into the class.
		// Merge in options from the defaults, followed by
		// the window object and the local hash if passed.
		self.options = $.extend({}, SorryAPI.DEFAULTS, window.SorryAPIOptions, options);
	};

	SorryAPI.DEFAULTS = {
		host: 'https://ro-api.sorryapp.com',
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
	SorryAPI.prototype.fetchPage = function(page_id, callback) {
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
			headers: { 'X-Plugin-Ping': 'status-bar' },
			data: { 
				include: 'brand,notices,notices.updates', // Get brand and notices in a sigle package.
				subscriber: self.options.subscriber // Pass optional subscriber configured in the client.
			},
			success: callback
		});
	};

})(jQuery, window, document);