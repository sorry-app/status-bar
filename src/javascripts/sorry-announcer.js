// Wait for jQuery to be ready.
$(document).ready(function() {
	// Set the configurable variables.
	// TODO: This should come from a config variable somewhere.
	//var status_page_url = 'http://status.sorryapp.com';
	var status_page_url = 'fixtures/apologies.json'; // Point at fixtures during testing.

	// Set the HTML template for the notices we're going to add.
	// Also include a link to the status page in here.
	// This is based on a Bootstrap alert. http://getbootstrap.com/components/#alerts
	var template = '<div class="alert alert-status alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span class="alert-text"></span> <a class="alert-link" href="' + status_page_url + '">' + status_page_url + '</a></div>';

	// Make a JSON request to acquire any apologies to display.
	$.ajax({
		dataType: "json",
		url: status_page_url,
		success: function(data, textStatus, jqXHR) {
			// Loop over the apologies that we have been handed back.
			$.each(data.response, function(index, apology) {
				// Get a reference to the template we're going to use.
				// Wrap it in a jQuery object so we can filter the contents.
				var $template = $(template)

				// Assign an ID to the DOM element - we reference this later on to remember when dismissed.
				$template.attr('id', 'apology-' + apology.id);
				// Swap out the content in the template.
				$template.find('.alert-text').text(apology.description);

				// Append the template to the DOM.
				// We put this at the begining of the <body> tag so it's at the top of the DOM.
				$('body').prepend($template);

				// TODO: Show / Animate the alert as it'll be hidden by default.
			});
		}

		// TODO: Error softly when things go wrong.
	});

	// Bind the close event on any of the alerts which are added.
	$('body').on('click', '.alert-status .close', function(e) {
		// Remove the parent from the DOM.
		// TODO: This should be animated.
		// TODO: Remember which item within the DOM we're removing.
		$(this).parent().remove();
	});
});