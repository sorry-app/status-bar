$(function () {

	// Module for the status bar plugin.
	module("status-bar");

		test("should provide no conflict", function () {
			// See if it response to noConflict call.
			var status_bar = $.fn.statusBar.noConflict();

			// Assert the result we wanted.
			ok(!$.fn.statusBar, 'status bar was set back to undefined (org value)');

			// Reset the value.
			$.fn.statusBar = status_bar;
		});

		test("should be defined on jquery object", function () {
			// Ensure that it's applied as a jQuery plugin.
			ok($(document.body).statusBar, 'status-bar method is defined');
		});

		test("should return element", function () {
			// Ensure that it binds to an element as expected.
			// Pass in the constructor argument for the test.
			ok($(document.body).statusBar('payme')[0] == document.body, 'document.body returned');
		});

	// Tests for the basic utility methods.
	module("utility methods");

		test("should return path of the JS script", function() {
			// Ask the plugin to provide the path
			var status_bar = $('<div></div>').statusBar('payme').data('statusBar');

			// Ask the status bar for it's path.
			var path = status_bar.getpath();

			// Assert that the path is absolute related to current location as epected.
			equal(path, 'file:///Users/robertrawlins/Projects/status-bar/tests/unit/', 'path was as expected.');
		});

});