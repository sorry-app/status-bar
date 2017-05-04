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
				subscriber: self.options.subscriber // Pass optional subscriber configured in the client.
			},
			// Handle the response after JSON returned.
			success: function(response) {
				// Apply an specified filters to the result set.

				// Filter notices to give us only open ones for display.
				// We use the timeline_state to determine future and present notices, excluding past ones.
				response.response.notices = $.grep(response.response.notices, function(a) { return filters.notice_timeline_state.includes(a.timeline_state); });

				// See if we have any type filters to apply.
				if(typeof(filters.notice_type) != 'undefined' && filters.notice_type) {
					// We have some filters to apply to the type of notice.
					response.response.notices = $.grep(response.response.notices, function(a) {
						// Find those who's type matches those in the options.
						return filters.notice_type.split(',').includes(a.type);
					});
				}

				// See if we want to apply the component filter.
				if(typeof(filters.notice_component) != 'undefined' && filters.notice_component) {
					/* 
					 * Filter out those notices which are associated to the components provided
					 * in the data attribute list.
					 *
					 * This might be a direct association, or it may be through a components
					 * descendants or ancestors.
					 *
					 * We need to loop through the provided tree of associated components
					 * to see if we find any matches.
					 */
					response.response.notices = $.grep(response.response.notices, function(a) {
						// Assume we didn't find any matches.
						var found = false;

						// Loop over the provided filter IDs.
						$.each(filters.notice_component.toString().split(','), function(index, search_id) {
							// Loop through the component, and it's associated family.
							$.each(a.components, function(index, component) {
								// Compile this components ancestors and children into the mix.
								var component_family = [component].concat(component.descendants).concat(component.ancestors);

								// Loop over the family of components.
								$.each(component_family, function(index, family_component) {
									// Return a match if the ID matches that being searched/
									if(family_component.id.toString() == search_id) { 
										// Mark a match as being found.
										found = true; 
										// Break the loop.
										return false; 
									}
								});

								// Break out the loop if found.
								if (found) { return false; }
							});

							// Break out the loop if found.
							if (found) { return false; }					
						});

						// Return true/false if match found.
						return found;
					});
				}

				// Run the callback with the filtered response.
				callback(response);
			}
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