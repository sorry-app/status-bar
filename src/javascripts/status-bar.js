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
		self.template = '<div class="sorry-status-bar" id="sorry-status-bar-{{id}}"><button type="button" class="sorry-status-bar-close" data-dismiss="status-notice" aria-hidden="true">&times;</button><span class="sorry-status-bar-text">{{apology}}</span> <a href="{{link}}" target="_blank" class="sorry-status-bar-link">{{link}}</a></div>';
		self.frag = ''; // Empty string to contain the compiled template.

		// Build the frag for the element.
		self.buildFrag();
	};	

	StatusNotice.prototype.dismiss = function(e) {
		// Reference self again.
		var self = this;

		// Prevent the default click behaviour.
		e.preventDefault();

		// Get the target element.
		var target = $(this).parent();

		// Get the native numeric ID from the element.
		var id = target.attr('id').split('-')[3];

		// Get the previously discmissed items from local storage.
		// TODO: Could this be a helper method?
		var previously_dimissed = JSON.parse(window.localStorage.getItem('sorry_dismissed_status_ids'))  || [];

		// Remember the ID which we are dismissing by putting it in the array
		previously_dimissed.push(id);

		// Put that array in a serialized form in to local storage.
		window.localStorage.setItem('sorry_dismissed_status_ids', JSON.stringify(previously_dimissed));

		// Remove the parent from the DOM.
		// TODO: This should be animated.
		target.remove();
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

		// Append the template to the DOM.
		// We drop this in to the containing bar element.
		self.parent.$elem.prepend(self.frag);
	};	

	// Status Bar Class Definition. 

	var StatusBar = function (options, elem) {
		// Quick self refernce to the class.
		var self = this;

		// Reference the HTML element we're teathered too.
		self.elem = elem;
		self.$elem = $(elem);

		// Set a reference to the endpoing.
		self.endpoint = '//api.sorryapp.com/1/pages/' + options.sorrySubdomain + '/apologies/current';

		// Reference the dismissed items, if none in local storage then assume new array.
		self.dismissed = JSON.parse(window.localStorage.getItem('sorry_dismissed_status_ids')) || [];

		// Load in the supporting css assets.
		self.loadcss();

		// Run the plugin.
		self.run();
	};

	StatusBar.prototype.run = function() {
		// Reference self again.
		var self = this;

		// Run the core process.
		// Fetch the apologies and wait for complete.
		self.fetch().done(function(response) {
			// Loop over the reaponse object.
			$.each( response.response, function(index, apology) {
				// Only work with this if it's not been dismissed before.
				// We can do this by hunting through the dismissed list.
				// TODO: Logic of this IF is a little messy, maybe move to helper?				
				if($.inArray(String(apology.id), self.dismissed) < 0) {
					// Create a new status notice for the apology.
					var notice = new StatusNotice(self, apology);

					// Display the notice.
					notice.display();
				}
			});
		});	
	};	

	StatusBar.prototype.fetch = function() {
		// Reference self again.
		var self = this;

		// Make a JSON request to acquire any apologies to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: self.endpoint
		});
	};
	
	StatusBar.prototype.loadcss = function() {
		// Reference self again.
		var self = this;

		// TODO: We probably only need to do this in the event that we have something to display. We may be able to reduce the overhead of including the CSS if it's not needed.
		// Append the related CSS asset to the document.
		// This saves the user having to include it themselves.
		$("<link/>", {
			rel: "stylesheet",
			type: "text/css",
			href: self.getpath() + 'status-bar.min.css'
		}).appendTo("head");
	};

	StatusBar.prototype.getpath = function() {
		// Reference self again.
		var self = this;

		// Get a reference to all the script tags.
		var scriptTags = $('script');

		// We can always rely on the last script tag loaded to be this document.
		// So we can now abstract the path from it.
		// TODO: Can this be written more tidily with jQuery rather than native JS?
		return scriptTags[scriptTags.length - 1].src.split('?')[0].split('/').slice(0, -1).join('/') + '/';
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

	// Data-Api

	// Instantiate the plugin on window load.
	$(window).on('load', function () {
		// Attach the plugin to the body tag.
		$('[data-sorry-subdomain]').each(function () {
			// Instantiate the plugin.
			var $statusBar = $(this);

			// Bind it to the element.
			$statusBar.statusBar($statusBar.data());
		});
	});

	$(document).on('click.statusBar.data-api', '[data-dismiss="status-notice"]', StatusNotice.prototype.dismiss);

})(jQuery, window, document);