// Wrap this as a jQuery plugin.
(function($, window, document, undefined) { "use strict";

	// Status Notice.

	var StatusNotice = function (parent, attributes) {
		// Quick self refernce to the class.
		var self = this;

		// Set the properties.
		self.attributes = attributes;

		// Set the related objects.
		self.parent = parent;

		// Define the template for the class.
		self.template = '<div class="sorry-status-notice" id="sorry-status-notice-{{id}}"><button type="button" class="sorry-status-notice-close" data-dismiss="status-notice" aria-hidden="true">&times;</button><span class="sorry-status-notice-text">{{apology}}</span> <a href="{{link}}" target="_blank" class="sorry-status-notice-link">{{link}}</a></div>';
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
		self.parent.dismissed.push(self.attributes.id);

		// Put that array in a serialized form in to local storage.
		window.localStorage.setItem('sorry_dismissed_status_ids', JSON.stringify(self.parent.dismissed));

		// Remove the parent from the DOM.
		// TODO: This should be animated.
		self.$elem.remove();
	};

	StatusNotice.prototype.buildFrag = function() {
		// Reference self again.
		var self = this;

		// Append the classes frag with the compfile template.
		self.frag +=
		self.template.replace( /{{apology}}/ig, self.attributes.description ) // Swap the description.
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
		self.dismissed = JSON.parse(window.localStorage.getItem('sorry_dismissed_status_ids')) || [];
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
		self.fetch_apologies().done(function(response) {
			// Loop over the reaponse object.
			$.each( response.response, function(index, apology) {
				// Only work with this if it's not been dismissed before.
				// We can do this by hunting through the dismissed list.
				// TODO: Logic of this IF is a little messy, maybe move to helper?				
				if($.inArray(apology.id, self.dismissed) < 0) {
					// Create a new status notice for the apology.
					var notice = new StatusNotice(self, apology);

					// Display the notice.
					notice.display();
				}
			});
		});	
	};

	StatusBar.prototype.set_style = function() {
		// Reference self again.
		var self = this;	

		// Run the core process.
		// Fetch the apologies and wait for complete.
		self.fetch_branding().done(function(response) {
			// Abstract the bar colour from the response.
			var bar_color = response.response.color_state_warning;

			// Set the bar colour using the CSS.
			self.$elem.css('background-color', bar_color);
		});
	};

	StatusBar.prototype.fetch_apologies = function() {
		// Reference self again.
		var self = this;

		// Make a JSON request to acquire any apologies to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: self.apologies_endpoint
		});
	};

	StatusBar.prototype.fetch_branding = function() {
		// Reference self again.
		var self = this;

		// Make a JSON request to acquire any apologies to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: self.branding_endpoint
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