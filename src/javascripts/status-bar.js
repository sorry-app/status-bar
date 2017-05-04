/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function(window, document, undefined) { "use strict";

	/*
	 * Load in an dependancies required by this plugin.
	 *
	 * These are pulled inline by the Browserify package ready for
	 * distribution, and properly scopes and namespaced for safety.
	 */
	// Stripped back jQuery.
	var $ = require('jquery');
	// API Wrapper for the Status Page API.
	var api = require('sorry-api');
	// Patching for <link> onload event support.
	var onloadCSS = require('./vendor/onloadCSS'); // Callbacks when file loads.
	// Use handlebars for templating.
	var handlebars = require('handlebars');

	/*
	 * We include handlebars-helpers package in the bundle as it has
	 * lot of useful resources, but it's also fairly chunky.
	 *
	 * So we're requiring and registering each helper on it's own as
	 * we use them, rather than including all 100+
	 */
	// Smarter if statements.
	handlebars.registerHelper(require('handlebars-helpers/lib/comparison'));
	// Date/time formatting for planned notices.
	handlebars.registerHelper(require('handlebars-helpers/lib/date'));

	/*
	 *
	 * Raven.js error logging allows us to better track what errors
	 * happen to ocurr once the file is included in the wild.
	 *
	 */

	var configureRaven = function() {
		// Create a noConflict in case already instantiated.
		var SorryRaven = Raven.noConflict();

		// Configure this instance to hit our Sentry accuont.
		SorryRaven.config('https://fe8e83188d1d452d9f56e445a82102b6@app.getsentry.com/74508', {
			whitelistUrls: [ /status\-bar\.min\.js/ ] // Only track errors in the status bar itself.
		}).install();
	};

	if (typeof(Raven) === "undefined") {
		// Raven does not exist, we should load it ourselves
		// before we configure it to catch errors.
		$.getScript('https://cdn.ravenjs.com/2.3.0/raven.min.js', function() {
			// Raven has now been loaded and we can configure
			// it to be used to catch errors.
			configureRaven();
		});
	} else {
		// Raven is already loaded into the window, use it
		// to configure and catch errors for the plugin.
		configureRaven();
	}

	/*
	 *
	 * Status Notice.
	 *
	 * Each status bar may have several notices to display depending
	 * on how many are open on the page, how many have been previously
	 * seen or dismissed.
	 *
	 * This class is responsible for rendering each notices and
	 * providing the behaviour to dismiss them.
	 *
	 */

	var StatusNotice = function (parent, attributes, update) {
		// Quick self refernce to the class.
		var self = this;

		// Set the properties.
		self.attributes = attributes;
		self.update = update;

		// Set the related objects.
		self.parent = parent;

		// Define the template for the class.
		self.template = '\
		{{!-- A container for each notice, classed with its type, state, etc. --}}\
		<div class="sorry-status-notice sorry-status-notice-{{notice.type}} sorry-status-notice-{{notice.state}}" id="sorry-status-notice-{{notice.id}}" role="alert">\
			{{!-- The close button / icon to dismiss each notice. --}}\
			<button type="button" class="sorry-status-notice-close" data-dismiss="status-notice" aria-hidden="true"><i class="sorry-status-notice-icon sorry-status-notice-icon-times-circle"></i></button>\
			\
			{{!-- The details for each notice, and a read-more link. --}}\
			<div class="sorry-status-notice-content">\
				<div class="sorry-status-notice-details">\
					{{!-- The state of the notice, translated text from "text.states" object. --}}\
					<h4 class="sorry-status-notice-header"><i class="sorry-status-notice-icon sorry-status-notice-icon-bullhorn"></i> {{lookup text.states notice.state}}</h4>\
					<p class="sorry-status-notice-text">\
						{{!-- Optional scheduled date for scheduled notices --}}\
						{{#is notice.state "scheduled"}}<time datetime="{{notice.begins_at}}" class="sorry-status-notice-schedule">{{moment notice.begins_at format="MMM Do, h:mma"}}</time>{{/is}}\
						{{!-- The description of the update to be displayed. --}}\
						{{update.content}}\
					</p>\
				</div>\
				{{!-- A link to the status page, with text/title provided in the "text.links.more" object. --}}\
				<a class="sorry-status-notice-link" href="{{notice.link}}" target="_blank" title="{{text.links.more.title}}">{{text.links.more.text}} &#8594;</a>\
			</div>\
		</div>';
		// Empty string to contain the compiled template.
		self.frag = '';

		// Build the frag for the element.
		self.buildFrag();
	};	

	StatusNotice.prototype.dismiss = function(e) {
		// Reference self again.
		var self = this;

		// Prevent the default click behaviour.
		e.preventDefault();

		// Remember the ID which we are dismissing by putting it in the array
		self.parent.dismissed[self.attributes.id] = new Date();

		// Put that array in a serialized form in to local storage.
		window.localStorage.setItem('sorry-status-bar', JSON.stringify(self.parent.dismissed));

		// Remove the parent from the DOM.
		// TODO: This should be animated.
		self.$elem.remove();
	};

	StatusNotice.prototype.buildFrag = function() {
		// Reference self again.
		var self = this;

		// Compile the template into handlebars.
		var template = handlebars.compile(self.template);

		// Render the template with the notice
		// and the specific update for display.
		self.frag += template({
			// JSON Object of the notice and update as
			// per the API response.
			"notice": self.attributes,
			"update": self.update,
			// Include text translations to the template as
			// we may allow users to override in future, or provide
			// multiple lingual support.
			//
			// TODO: Make this configurable by the user.
			"text": {
				"states": {
					"open": "Ongoing",
					"scheduled": "Scheduled",
					"underway": "Underway"
				},
				"links": {
					"more": {
						"title": "Visit our Status Page for more information.",
						"text": "More"
					}
				}
			}
		});
	};

	StatusNotice.prototype.display = function() {
		// Reference self again.
		var self = this;

		// Get the frag we're going to create.
		self.$elem = $(self.frag);

		// Append the template to the DOM.
		// We drop this in to the containing bar element.
		self.parent.$elem.prepend(self.$elem);

		// Bind a click event for the dsmiss button.
		self.$elem.find('[data-dismiss="status-notice"]').bind('click.dismiss.status-notice', $.proxy(this.dismiss, this));
	};	

	/*
	 *
	 * Status Notice.
	 *
	 * The status bar is the core class for the plugin
	 * and is responsible for gathering the data from
	 * the API and rending multiple notices.
	 *
	 */

	var StatusBar = function (options, elem) {
		// Quick self refernce to the class.
		var self = this;

		// Reference the HTML element we're teathered too.
		self.elem = elem;
		self.$elem = $(elem);

		// Store the options into the instance.
		self.options = options;

		// Create an instance of the API.
		self.api = new api.SorryAPI();

		// Reference the dismissed items, if none in local storage then assume new array.
		self.dismissed = JSON.parse(window.localStorage.getItem('sorry-status-bar')) || {};
	};

	StatusBar.prototype.init = function() {
		// Reference self again.
		var self = this;

		// Request the page data from the API.
		// INFO: We pipe the status-bar-for value to support formats on various jQuery versions.
		//       The first is latter versions of jQuery, the second is earlier vertions.		
		self.api.fetchPage((self.options.statusBarFor || self.options['status-bar-for']), function(response) {
			// We now have the page data from the API and
			// can render the status notices.

			// Load in the supporting css assets.
			// TODO: Combine CSS import and styling?
			self.loadcss(function() {
				// Style the plugin.
				self.set_style(response.response.brand);

				// Run the plugin.
				self.render(response.response.notices);
			});
		});
	};

	StatusBar.prototype.render = function(notices) {
		// Reference self again.
		var self = this;

		// Filter notices to give us only open ones for display.
		// We use the timeline_state to determine future and present notices, excluding past ones.
		var $notices = $.grep(notices, function(a) { return ['present', 'future'].includes(a.timeline_state); });

		// See if we have any type filters to apply.
		if(typeof(self.options.filterType) != 'undefined' && self.options.filterType) {
			// We have some filters to apply to the type of notice.
			$notices = $.grep($notices, function(a) {
				// Find those who's type matches those in the options.
				return self.options.filterType.split(',').includes(a.type);
			});
		}

		// Loop over the open notices.
		$.each($notices, function(index, notice) {
			// Check to see if we've seen this update before?
			if (self.dismissed.hasOwnProperty(notice.id)) {
				// Find an update which we haven't yet displayed.
				$.each(notice.updates.reverse(), function(index, update) {
					// We've seen this notice before.
					// Check to see if the updates was published since we last displayed one.
					if(update.created_at > self.dismissed[notice.id]) {
						// Create a new status notice for the notice.
						var notice_obj = new StatusNotice(self, notice, update);

						// Display the notice.
						notice_obj.display();

						// Break from the loop.
						return false;
					}
				});
			} else {
				// We've not seen this notice before.
				// Display the first update.
				// Create a new status notice for the notice.
				var notice_obj = new StatusNotice(self, notice, notice.updates[notice.updates.length - 1]);

				// Display the notice.
				notice_obj.display();						
			}
		});
	};

	StatusBar.prototype.set_style = function(brand) {
		// Reference self again.
		var self = this;

		// Create a CSS template for the colour/branding.
		var css_template = " \
			.sorry-status-bar { \
				background-color: {{background_color}};\
			} \
			.sorry-status-notice-header, .sorry-status-notice-text, .sorry-status-notice-schedule {\
				color: {{text_color}}; \
			}\
			.sorry-status-notice-link, .sorry-status-notice-link:hover { \
				border-color: {{link_color}}; \
				color: {{link_color}}; \
			} \
			.sorry-status-notice-close, .sorry-status-notice-close:hover { \
				color: {{text_color}}; \
			} \
		";

		// Abstract the bar colour from the response.
		var background_color = brand.color_header_background;
		var text_color = brand.color_header_text;
		var link_color = brand.color_header_links;
		var state_warning_color = brand.color_state_warning;

		// Compfile the style / brand CSS snippet.
		var compiled = css_template.replace( /{{text_color}}/ig, text_color )
			.replace( /{{background_color}}/ig, background_color )
			.replace( /{{link_color}}/ig, link_color )
			.replace( /{{state_warning_color}}/ig, state_warning_color );

		// Append the inline styles to the document.
		$('head').append('<style>' + compiled + '</style>');
	};

	StatusBar.prototype.loadcss = function(callback) {
		// Reference self again.
		var self = this;

		// Compile a CSS script tag using the path given by this JS script.
		var style_include_tag = $("<link/>", {
			rel: "stylesheet",
			type: "text/css",
			href: self.getpath() + 'status-bar.min.css'
		});

		// Trigger callback when finally loaded.
		onloadCSS.onloadCSS(style_include_tag[0], callback);

		// Determine the destination for the stylesheet to be injected.
		// If no stylesheets already in place we inject into the head.
		// If stylesheets do exist we place ours before any of theres.
		if ( $('link').length ) {
			// We have link tags. So the destination is before these.
			$($('link')[0]).before(style_include_tag);
		} else {
			// We don't have any link tags, so append it to the head.
			style_include_tag.appendTo($('head'));
		}
	};

	StatusBar.prototype.getpath = function() {
		// Reference self again.
		var self = this;

		// Get a reference to the script tag which looks like this
		// one. JS doesn't provide an easy way to do this, so we'll use a jQuery
		// selector to find a script with a source which looks like this.
		var scripttag = $('script[src$="status-bar.min.js"]')[0];

		// Now we have our scripts, we can get the full source and strip
		// out the path directory, which we can use to find matching CSS.
		return scripttag.src.split('?')[0].split('/').slice(0, -1).join('/') + '/';
	};

	// jQuery Plugin Definition.

	// Reference the noflict version.
	var old = $.fn.statusBar;

	// Define the plugin.
	$.fn.statusBar = function (options) {
		// Allow it to be applied to multiple elements.
		// TODO: Do we want to restrict this to a single instance?
		return this.each(function () {
			// Create an instance of the status bar class.
			var statusBar = new StatusBar(options, this);

			// Bind the class to the data for the DOM element.
			$.data( this, 'statusBar', statusBar );
		});
	};

	// No Conflict
	// Copied from the Bootstrap JS widgets, to avoid name conflicts.

	$.fn.statusBar.noConflict = function () {
		$.fn.statusBar = old;
		return this;
	};

	// Preload the DOM elements.
	$.fn.statusBar.setup = function() {
		// Get a reference to the script tag including the plugin.
		var script_tag = $($('script[src$="status-bar.min.js"]')[0]);
		// Determine any pages assigned to the script tag.
		// Default to no pages if we don't find any.
		var pages = script_tag.data("for") || "";

		// Loop over all pages assigned on the including script tag.
		// TODO: Can we abstract this out into a separate method?
		$(pages.split(",")).each(function() {
			// Check to see if a status bar locator is present.
			if($('[data-status-bar-for="' + this + '"]').length === 0) {
				// We don't have a container / locator for our status bar
				// so we need to inject one into the DOM near the opening
				// body tag.
				var div_tag = $('<div />', {
					// Set the class on the new tag.
					'class': 'sorry-status-bar',
					// Copy the reference to the status page.
					'data-status-bar-for': this,
					// Copy the other data attributes.
					// TODO: Can we dynamically copy all of them?
					'data-filter-type': script_tag.data("filter-type"),
					'data-filter-components': script_tag.data("filter-components"),
				// Attach it to the body.
				}).prependTo('body');
			}
		});
	};

	// Data-Api

	// Instantiate the plugin on window load.
	$(window).bind('load', function () {
		// Preload the statusbar DOM elements.
		$.fn.statusBar.setup();

		// Attach the plugin to the body tag.
		$('[data-status-bar-for]').each(function () {
			// Instantiate the plugin.
			var $statusBar = $(this);

			// Bind it to the element.
			// Pass in the config for the status bar from the script tags data.
			$statusBar.statusBar($statusBar.data());

			// Initialize the plugin.
			$statusBar.data('statusBar').init();
		});
	});

})(window, document);