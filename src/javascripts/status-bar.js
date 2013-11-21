// Wrap this as a jQuery plugin.
(function($, window, document, undefined) {

	// Define the status bar class.
	var StatusBar = {
		// Constructor method.
		init: function(options, elem) {
			// Quick self refernce to the class.
			var self = this;

			// Reference the HTML element we're teathered too.
			self.elem = elem;
			self.$elem = $( elem );

			// Validate we have all the required elements for the plugin.
			// We need a data attribute of the page ID before we can continue.
			if (!$("body").attr('data-sorry-subdomain')) throw new Error('You must set a data attribute on the body tag for sorry-subdomain which contains the subdomain of your Sorry status page.');
			// Ensure local storage is available for us to use.
			if(typeof(Storage) == "undefined") throw new Error('Local storage is not supported or enabled in the browser, Status Bar cannot run.');

			// Set a reference to the endpoing.
			self.endpoint = '//api.sorryapp.com/1/pages/' + options.sorrySubdomain + '/apologies/current';

			// Set the HTML template for the notices we're going to add.
			// Also include a link to the status page in here.
			// This is based on a Bootstrap alert. http://getbootstrap.com/components/#alerts
			self.template = $('<div class="sorry-status-bar"><button type="button" class="sorry-status-bar-close" aria-hidden="true">&times;</button><span class="sorry-status-bar-text"></span> <a target="_blank" class="sorry-status-bar-link"></a></div>');

			// Reference the dismissed items, if none in local storage then assume new array.
			self.dismissed = JSON.parse(window.localStorage.getItem('sorry_dismissed_status_ids')) || [];

			// Load in the supporting css assets.
			self.loadcss();

			// Bind the close event on any of the alerts which are added.
			$('body').delegate('.sorry-status-bar-close', 'click', function(e) {
				// Prevent the default click behaviour.
				e.preventDefault();

				// Target the parent element of the close button.
				var target = $(this).parent();

				// Action the close method on the targer.
				self.dismiss(target);
			});

			// Run the plugin.
			self.run();
		},

		getpath: function() {
			// Reference self again.
			var self = this;

			// Get a reference to all the script tags.
			var scriptTags = $('script');

			// We can always rely on the last script tag loaded to be this document.
			// So we can now abstract the path from it.
			// TODO: Can this be written more tidily with jQuery rather than native JS?
			return scriptTags[scriptTags.length - 1].src.split('?')[0].split('/').slice(0, -1).join('/') + '/';
		},

		loadcss: function() {
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
		},

		fetch: function() {
			// Reference self again.
			var self = this;

			// Make a JSON request to acquire any apologies to display.
			return $.ajax({
				type: "GET",
				crossDomain: true, 
				dataType: "json",
				url: self.endpoint
			});
		},

		buildFrag: function(apologies) {
			// Reference self again.
			var self = this;

			// Loop over the apologies that we have been handed back.
			$.each( apologies, function(index, apology) {
				// Only work with this if it's not been dismissed before.
				// We can do this by hunting through the dismissed list.
				// TODO: Logic of this IF is a little messy, maybe move to helper?
				if($.inArray(String(apology.id), self.dismissed) < 0) {
					// Assign an ID to the DOM element - we reference this later on to remember when dismissed.
					self.template.attr('id', 'sorry-status-bar-' + apology.id);
					// Swap out the content in the template.
					self.template.find('.sorry-status-bar-text').text(apology.description);
					// Update the link to the apology
					self.template.find('.sorry-status-bar-link').attr('href', apology.link).text(apology.link);
				}
			});
		},

		dismiss: function(target) {
			// Reference self again.
			var self = this;

			// Get the native numeric ID from the element.
			var id = target.attr('id').split('-')[3];
			// Remember the ID which we are dismissing by putting it in the array
			self.dismissed.push(id);
			// Put that array in a serialized form in to local storage.
			window.localStorage.setItem('sorry_dismissed_status_ids', JSON.stringify(self.dismissed));

			// Remove the parent from the DOM.
			// TODO: This should be animated.
			target.remove();
		},

		display: function() {
			// Reference self again.
			var self = this;

			// Append the template to the DOM.
			// We put this at the begining of the <body> tag so it's at the top of the DOM.
			self.$elem.prepend(self.template);
		},

		run: function() {
			// Reference self again.
			var self = this;

			// Run the core process.
			// Fetch the apologies and wait for complete.
			self.fetch().done(function(fetch) {
				// Build the template fragmenet with the apologies.
				self.buildFrag(fetch.response);

				// Display the results.
				self.display();
			});	
		}
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
			var statusBar = Object.create( StatusBar );

			// Initilize the class with the options provided.
			statusBar.init( options, this );

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
		$('body').each(function () {
			// Instantiate the plugin.
			var $statusBar = $(this);

			// Bind it to the element.
			$statusBar.statusBar($statusBar.data());
		});
	});

})(jQuery, window, document);