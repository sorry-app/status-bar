$(function () {

	// Module for the status bar plugin.
	module("status-bar plugin");

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
			// NOTE: This will fail if the project is moved to a new home - could do with being better written.
			equal(path, 'file:///Users/robertrawlins/Projects/status-bar/tests/unit/', 'path was as expected.');
		});

		test("should load the approriate CSS asset in to the DOM.", function () {
			// Create an instance of the status bar for us to test.
			var status_bar = $('<div></div>').statusBar('payme').data('statusBar');

			// Count the number of CSS includes already on the page.
			var existing_css_includes = $("link").length;

			// Ask the plugin to add the elements to the DOM.
			// NOTE this will load a CSS asset which cannot be found, due to the path not being right.
			status_bar.loadcss()

			// Assert the includes have incremented by one.
			equal($("link").length - existing_css_includes, 1, 'The CSS was not appened to the document.');
		});

});