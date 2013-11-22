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

});