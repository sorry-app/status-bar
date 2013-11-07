// Wait for jQuery to be ready.
// TODO: Turn this in to a bootstap style jQuery plugin, rather than vanilla code.
$(document).ready(function() {
	// Validate we have all the required elements for the plugin.
	// We need a data attribute of the page ID before we can continue.
	if (!$("body").attr('data-sorry-announcement')) throw new Error('You must set a data attribute on the body tag for sorry-announcement which contains the ID of your Sorry status page.');
	// Ensure local storage is available for us to use.
	if(typeof(Storage) == "undefined") throw new Error('Local storage is not supported or enabled in the browser, Sorry Announcer cannot run.');

	// Set the configurable variables.
	// The page ID is used in the API calls that we make, and any chanels for PUSH subscription.
	// We pull this from a data attirbute in the HTML, on the body tag.
	// TODO: Should we support multiple pages here in future?
	var page_id = $('body').data('sorry-announcement');

	// Reference the dismissed items, if none in local storage then assume new array.
	var dismissed = JSON.parse(window.localStorage.getItem('sorry_dismissed_status_ids')) || [];

	// Set the HTML template for the notices we're going to add.
	// Also include a link to the status page in here.
	// This is based on a Bootstrap alert. http://getbootstrap.com/components/#alerts
	var template = '<div class="sorry-announcement"><button type="button" class="sorry-announcement-close" aria-hidden="true">&times;</button><span class="sorry-announcement-text"></span> <a target="_blank" class="sorry-announcement-link"></a></div>';

	// Make a JSON request to acquire any apologies to display.
	$.ajax({
		type: "GET",
		crossDomain: true, 
		dataType: "json",
		url: '/* @echo api_endpoint */' + '/api/1/pages/' + page_id + '/apologies/current', // API endpoing for the page.
		success: function(data, textStatus, jqXHR) {
			// Loop over the apologies that we have been handed back.
			$.each(data.response, function(index, apology) {
				// Only work with this if it's not been dismissed before.
				// We can do this by hunting through the dismissed list.
				// TODO: Logic of this IF is a little messy, maybe move to helper?
				if($.inArray(String(apology.id), dismissed) < 0) {
					// Get a reference to the template we're going to use.
					// Wrap it in a jQuery object so we can filter the contents.
					var $template = $(template);

					// Assign an ID to the DOM element - we reference this later on to remember when dismissed.
					$template.attr('id', 'sorry-announcement-' + apology.id);
					// Swap out the content in the template.
					$template.find('.sorry-announcement-text').text(apology.description);
					// Update the link to the apology
					$template.find('.sorry-announcement-link').attr('href', apology.link).text(apology.link);

					// Append the template to the DOM.
					// We put this at the begining of the <body> tag so it's at the top of the DOM.
					$('body').prepend($template);

					// TODO: Show / Animate the alert as it'll be hidden by default.
				}
			});
		}

		// TODO: Error softly when things go wrong.
	});

	// Bind the close event on any of the alerts which are added.
	$('body').on('click', '.sorry-announcement-close', function() {
		// Target the parent element of the close button.
		var target = $(this).parent();
		// Get the native numeric ID from the element.
		var id = target.attr('id').split('-')[2];
		// Remember the ID which we are dismissing by putting it in the array
		dismissed.push(id);
		// Put that array in a serialized form in to local storage.
		window.localStorage.setItem('sorry_dismissed_status_ids', JSON.stringify(dismissed));

		// Remove the parent from the DOM.
		// TODO: This should be animated.
		target.remove();
	});
});