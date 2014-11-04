/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function($, window, document, undefined) { "use strict";

	// Status Notice.

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
		<div class="sorry-status-notice" id="sorry-status-notice-{{id}}" role="alert">\
			<button type="button" class="sorry-status-notice-close" data-dismiss="status-notice" aria-hidden="true">hide</button>\
			\
			<div class="sorry-status-notice-content">\
				<span class="sorry-status-notice-label">Ongoing</span> <a class="sorry-status-notice-link" href="{{link}}" target="_blank" title="Visit our Status Page for more information.">{{apology}}</a>\
			</div>\
		</div>';
		self.frag = ''; // Empty string to contain the compiled template.

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

		// Append the classes frag with the compfile template.
		self.frag +=
		self.template.replace( /{{apology}}/ig, self.update.content ) // Swap the description.
						.replace( /{{link}}/ig, self.attributes.link ) // Swap the link.
						.replace( /{{id}}/ig, self.attributes.id ); // Swap the ID.
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
		self.$elem.on('click.dismiss.status-notice', '[data-dismiss="status-notice"]', $.proxy(this.dismiss, this));
	};	

	// Status Bar Class Definition. 

	var StatusBar = function (options, elem) {
		// Quick self refernce to the class.
		var self = this;

		// Reference the HTML element we're teathered too.
		self.elem = elem;
		self.$elem = $(elem);

		// Set a reference to the endpoint.
		// Set a reference to the base endppint for the page.
		self.endpoint = '//api.sorryapp.com/1/pages/' + options.statusBarFor;
		// And the apologies andpoint.
		self.apologies_endpoint = self.endpoint + '/apologies/current';
		// And the branding endpoint.
		self.branding_endpoint = self.endpoint + '/brand';

		// Reference the dismissed items, if none in local storage then assume new array.
		self.dismissed = JSON.parse(window.localStorage.getItem('sorry-status-bar')) || {};
	};

	StatusBar.prototype.init = function() {
		// Reference self again.
		var self = this;
		
		// Load in the supporting css assets.
		self.loadcss();

		// Style the plugin.
		self.set_style();

		// Run the plugin.
		self.run();
	};

	StatusBar.prototype.run = function() {
		// Reference self again.
		var self = this;

		// Run the core process.
		// Fetch the apologies and wait for complete.
		self.fetch(self.apologies_endpoint).done(function(response) {
			// Loop over the reaponse object.
			$.each( response.response, function(index, apology) {
				// Check to see if we've seen this update before?
				if (self.dismissed.hasOwnProperty(apology.id)) {
					// Find an update which we haven't yet displayed.
					$.each(apology.updates.reverse(), function(index, update) {
						// We've seen this apology before.
						// Check to see if the updates was published since we last displayed one.
						if(update.created_at > self.dismissed[apology.id]) {
							// Create a new status notice for the apology.
							var notice = new StatusNotice(self, apology, update);

							// Display the notice.
							notice.display();

							// Break from the loop.
							return false;
						}
					});
				} else {
					// We've not seen this apology before.
					// Display the first update.
					// Create a new status notice for the apology.
					var notice = new StatusNotice(self, apology, apology.updates.last());

					// Display the notice.
					notice.display();						
				}
			});
		});	
	};

	StatusBar.prototype.set_style = function() {
		// Reference self again.
		var self = this;

		// Create a CSS template for the colour/branding.
		var css_template = " \
			.sorry-status-bar { \
				background-color: {{background_color}};\
			} \
			.sorry-status-notice-content, .sorry-status-notice-link { \
				color: {{text_color}}; \
			} \
			.sorry-status-notice-close { \
				color: {{link_color}}; \
			} \
			.sorry-status-notice-label {\
				background-color: {{state_warning_color}}; \
			} \
		";

		// Run the core process.
		// Fetch the apologies and wait for complete.
		self.fetch(self.branding_endpoint).done(function(response) {
			// Abstract the bar colour from the response.
			var background_color = response.response.color_header_background;
			var text_color = response.response.color_header_text;
			var link_color = response.response.color_header_links;
			var state_warning_color = response.response.color_state_warning;

			// Compfile the style / brand CSS snippet.
			var compiled = css_template.replace( /{{text_color}}/ig, text_color )
				.replace( /{{background_color}}/ig, background_color )
				.replace( /{{link_color}}/ig, link_color )
				.replace( /{{state_warning_color}}/ig, state_warning_color );

			// Append the inline styles to the document.
			$('head').append('<style>' + compiled + '</style>');
		});
	};

	StatusBar.prototype.fetch = function(target_url) {
		// Make a JSON request to acquire any apologies to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: target_url,
			headers: { 'X-Plugin-Ping': 'status-bar' }
		});
	};
	
	StatusBar.prototype.loadcss = function() {
		// Reference self again.
		var self = this;

		// Compile a CSS script tag using the path given by this JS script.
		var style_include_tag = $("<link/>", {
			rel: "stylesheet",
			type: "text/css",
			href: self.getpath() + 'status-bar.min.css'
		});

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
		// Loop over all pages assigned on the including script tag.
		// TODO: Can we shorthand this somehow?
		// TODO: Can we abstract this out into a seperate metho?
		$($('script[src$="status-bar.min.js"]')[0].getAttribute("data-for").split(",")).each(function() {
			// Check to see if a status bar locator is present.
			if($('[data-status-bar-for="' + this + '"]').length === 0)
				// We don't have a container / locator for our status bar
				// so we need to inject one into the DOM near the opening
				// body tag.
				$('body').prepend('<div class="sorry-status-bar" data-status-bar-for="' + this + '"></div>');
		});
	};

	// Data-Api

	// Instantiate the plugin on window load.
	$(window).on('load', function () {
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

})(jQuery, window, document);