$(function () {

	// Module for the status bar plugin.
	module("status-bar plugin");

		// Plugin Methods.

		test("should inject the container html if not present", function() {
			// Initialize the plugin
			$.fn.statusBar.setup();

			// Check that the DOM elements were added to the DOM as you'd expect.
			// Check that the dom container element doesn't exist.
			equal($("[data-status-bar-for]").length, 1, 'The HTML elements were not added to the dom.');			
		});

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
			ok($(document.body).statusBar({'statusBarFor':'test'})[0] == document.body, 'document.body returned');
		});

		test("should assign the right API endpoint", function() {
			// Assert that the correct endpoint it picked up.
			var status_bar = $('<div></div>').statusBar({'statusBarFor':'test'});

			// Assert that an endpoint was created as planned.
			equal(status_bar.data('statusBar').endpoint, 'https://ro-api.sorryapp.com/v1/pages/test', 'The correct API endpoint was assigned.');
		});

	// Test the core application run.
	module("core methods", {
		setup: function() {
			// prepare something for all following tests
			// Ask the plugin to provide the path
			status_bar = $('<div></div>').statusBar({'statusBarFor':'test'}).data('statusBar');
		}
	});	

		test("should run without errors", function() {
			// Request the run method on the status bar.
			status_bar.run();
		});

	// Tests for the basic utility methods.
	module("utility methods", {
		setup: function() {
			// prepare something for all following tests
			// Ask the plugin to provide the path
			status_bar = $('<div></div>').statusBar({'statusBarFor':'test'}).data('statusBar');
		}
	});

		test("should return path of the JS script", function() {
			// Ask the status bar for it's path.
			var path = status_bar.getpath();

			// Assert that the path is absolute related to current location as epected.
			// NOTE: This will fail if the project is moved to a new home - could do with being better written.
			equal(path, 'file:///Users/robertrawlins/Sites/status-bar/dist/', 'path was as expected.');
		});

		test("should load the approriate CSS asset in to the DOM.", function () {
			// Count the number of CSS includes already on the page.
			var existing_css_includes = $("link").length;

			// Ask the plugin to add the elements to the DOM.
			// NOTE this will load a CSS asset which cannot be found, due to the path not being right.
			status_bar.loadcss()

			// Assert the includes have incremented by one.
			equal($("link").length - existing_css_includes, 1, 'The CSS was not appened to the document.');
		});

});