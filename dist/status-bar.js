(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function($, window, document, undefined) { "use strict";

	/*
	 * Load in an dependancies required by this plugin.
	 *
	 * These are pulled inline by the Browserify package ready for
	 * distribution, and properly scopes and namespaced for safety.
	 */
	// Cross-Domain AJAX Support for jQuery in IE 8/9.
	var legacy_cors_support = require('./vendor/jquery.xdomainrequest');
	// API Wrapper for the Status Page API.
	var api = require('./vendor/sorry');
	// Utilities for Loading Notice Styles.
	var loadCSS = require('./vendor/loadCSS');
	var onloadCSS = require('./vendor/onloadCSS'); // Callbacks when file loads.
	// Utilitity for loading external JS assets.
	var loadJS = require('./vendor/loadJS');

	/*
	 *
	 * Raven.js error logging allows us to better track what errors
	 * happen to ocurr once the file is included in the wild.
	 *
	 */

	var configureRaven = function() {
		// Create a noConflict in case already instantiated.
		var SorryRaven = Raven.noConflict();

		// Configure this instance to hit our Sentry accuont.
		SorryRaven.config('https://fe8e83188d1d452d9f56e445a82102b6@app.getsentry.com/74508', {
			whitelistUrls: [ /status\-bar\.min\.js/ ] // Only track errors in the status bar itself.
		}).install();
	};

	if (typeof(Raven) === "undefined") {
		// Raven does not exist, we should load it ourselves
		// before we configure it to catch errors.
		loadJS('https://cdn.ravenjs.com/2.3.0/raven.min.js', function() {
			// Raven has now been loaded and we can configure
			// it to be used to catch errors.
			configureRaven();
		});
	} else {
		// Raven is already loaded into the window, use it
		// to configure and catch errors for the plugin.
		configureRaven();
	}

	/*
	 *
	 * Status Notice.
	 *
	 * Each status bar may have several notices to display depending
	 * on how many are open on the page, how many have been previously
	 * seen or dismissed.
	 *
	 * This class is responsible for rendering each notices and
	 * providing the behaviour to dismiss them.
	 *
	 */

	var StatusNotice = function (parent, attributes, update) {
		// Quick self refernce to the class.
		var self = this;

		// Set the properties.
		self.attributes = attributes;
		self.update = update;

		// Set the related objects.
		self.parent = parent;

		// Define the template for the class.
		self.template = '<div class="sorry-status-notice" id="sorry-status-notice-{{id}}" role="alert">\
			<button type="button" class="sorry-status-notice-close" data-dismiss="status-notice" aria-hidden="true"><i class="sorry-status-notice-icon sorry-status-notice-icon-times-circle"></i></button>\
			\
			<div class="sorry-status-notice-content">\
				<h4 class="sorry-status-notice-header"><i class="sorry-status-notice-icon sorry-status-notice-icon-bullhorn"></i> Ongoing</h4>\
				<p class="sorry-status-notice-text">{{notice}}</p>\
				<a class="sorry-status-notice-link" href="{{link}}" target="_blank" title="Visit our Status Page for more information.">More &#8594;</a>\
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
		self.template.replace( /{{notice}}/ig, self.update.content ) // Swap the description.
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
		self.$elem.find('[data-dismiss="status-notice"]').bind('click.dismiss.status-notice', $.proxy(this.dismiss, this));
	};	

	/*
	 *
	 * Status Notice.
	 *
	 * The status bar is the core class for the plugin
	 * and is responsible for gathering the data from
	 * the API and rending multiple notices.
	 *
	 */

	var StatusBar = function (options, elem) {
		// Quick self refernce to the class.
		var self = this;

		// Reference the HTML element we're teathered too.
		self.elem = elem;
		self.$elem = $(elem);

		// Store the options into the instance.
		self.options = options;

		// Create an instance of the API.
		self.api = new api.SorryAPI();

		// Reference the dismissed items, if none in local storage then assume new array.
		self.dismissed = JSON.parse(window.localStorage.getItem('sorry-status-bar')) || {};
	};

	StatusBar.prototype.init = function() {
		// Reference self again.
		var self = this;

		// Request the page data from the API.
		// INFO: We pipe the status-bar-for value to support formats on various jQuery versions.
		//       The first is latter versions of jQuery, the second is earlier vertions.		
		self.api.fetchPage((self.options.statusBarFor || self.options['status-bar-for']), function(response) {
			// We now have the page data from the API and
			// can render the status notices.

			// Load in the supporting css assets.
			// TODO: Combine CSS import and styling?
			self.loadcss(function() {
				// Style the plugin.
				self.set_style(response.response.brand);

				// Run the plugin.
				self.render(response.response.notices);
			});
		});
	};

	StatusBar.prototype.render = function(notices) {
		// Reference self again.
		var self = this;

		// Filter notices to give us only open ones for display.
		var $open_notices = $.grep(notices, function(a) { return a.state == 'open'; });

		// Loop over the open notices.
		$.each($open_notices, function(index, notice) {
			// Check to see if we've seen this update before?
			if (self.dismissed.hasOwnProperty(notice.id)) {
				// Find an update which we haven't yet displayed.
				$.each(notice.updates.reverse(), function(index, update) {
					// We've seen this notice before.
					// Check to see if the updates was published since we last displayed one.
					if(update.created_at > self.dismissed[notice.id]) {
						// Create a new status notice for the notice.
						var notice_obj = new StatusNotice(self, notice, update);

						// Display the notice.
						notice_obj.display();

						// Break from the loop.
						return false;
					}
				});
			} else {
				// We've not seen this notice before.
				// Display the first update.
				// Create a new status notice for the notice.
				var notice_obj = new StatusNotice(self, notice, notice.updates[notice.updates.length - 1]);

				// Display the notice.
				notice_obj.display();						
			}
		});
	};

	StatusBar.prototype.set_style = function(brand) {
		// Reference self again.
		var self = this;

		// Create a CSS template for the colour/branding.
		var css_template = " \
			.sorry-status-bar { \
				background-color: {{background_color}};\
			} \
			.sorry-status-notice-header, .sorry-status-notice-text {\
				color: {{text_color}}; \
			}\
			.sorry-status-notice-link, .sorry-status-notice-link:hover { \
				color: {{link_color}}; \
			} \
			.sorry-status-notice-close, .sorry-status-notice-close:hover { \
				color: {{text_color}}; \
			} \
		";

		// Abstract the bar colour from the response.
		var background_color = brand.color_header_background;
		var text_color = brand.color_header_text;
		var link_color = brand.color_header_links;
		var state_warning_color = brand.color_state_warning;

		// Compfile the style / brand CSS snippet.
		var compiled = css_template.replace( /{{text_color}}/ig, text_color )
			.replace( /{{background_color}}/ig, background_color )
			.replace( /{{link_color}}/ig, link_color )
			.replace( /{{state_warning_color}}/ig, state_warning_color );

		// Append the inline styles to the document.
		$('head').append('<style>' + compiled + '</style>');
	};

	StatusBar.prototype.loadcss = function(callback) {
		// Reference self again.
		var self = this;
		// We don't have any link tags, so append it to the head.
		var before = $('head').children.last;

		// Determine the destination for the stylesheet to be injected.
		// If no stylesheets already in place we inject into the head.
		// If stylesheets do exist we place ours before any of theres.
		if ( $('link').length ) {
			// We have link tags. So the destination is before these.
			before = $($('link')[0]);
		}

		// Load the stylesheet using vendor lib.
		var stylesheet = loadCSS.loadCSS((self.getpath() + 'status-bar.min.css'), before[0]);
		
		// Trigger callback when finally loaded.
		onloadCSS.onloadCSS(stylesheet, callback);
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
		// Determine any pages assigned to the script tag.
		// Default to no pages if we don't find any.
		var pages = $('script[src$="status-bar.min.js"]')[0].getAttribute("data-for");

		// Loop over all pages assigned on the including script tag.
		// TODO: Can we shorthand this somehow?
		// TODO: Can we abstract this out into a seperate metho?
		if(pages) {
			$(pages.split(",")).each(function() {
				// Check to see if a status bar locator is present.
				if($('[data-status-bar-for="' + this + '"]').length === 0)
					// We don't have a container / locator for our status bar
					// so we need to inject one into the DOM near the opening
					// body tag.
					$('body').prepend('<div class="sorry-status-bar" data-status-bar-for="' + this + '"></div>');
			});
		}
	};

	// Data-Api

	// Instantiate the plugin on window load.
	$(window).bind('load', function () {
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
},{"./vendor/jquery.xdomainrequest":2,"./vendor/loadCSS":3,"./vendor/loadJS":4,"./vendor/onloadCSS":5,"./vendor/sorry":6}],2:[function(require,module,exports){
(function (global){
/*!
 * jQuery-ajaxTransport-XDomainRequest - v1.0.4 - 2015-03-05
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2015 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory((typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null));
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function($) {

// Only continue if we're on IE8/IE9 with jQuery 1.5+ (contains the ajaxTransport function)
if ($.support.cors || !$.ajaxTransport || !window.XDomainRequest) {
  return $;
}

var httpRegEx = /^(https?:)?\/\//i;
var getOrPostRegEx = /^get|post$/i;
var sameSchemeRegEx = new RegExp('^(\/\/|' + location.protocol + ')', 'i');

// ajaxTransport exists in jQuery 1.5+
$.ajaxTransport('* text html xml json', function(options, userOptions, jqXHR) {

  // Only continue if the request is: asynchronous, uses GET or POST method, has HTTP or HTTPS protocol, and has the same scheme as the calling page
  if (!options.crossDomain || !options.async || !getOrPostRegEx.test(options.type) || !httpRegEx.test(options.url) || !sameSchemeRegEx.test(options.url)) {
    return;
  }

  var xdr = null;

  return {
    send: function(headers, complete) {
      var postData = '';
      var userType = (userOptions.dataType || '').toLowerCase();

      xdr = new XDomainRequest();
      if (/^\d+$/.test(userOptions.timeout)) {
        xdr.timeout = userOptions.timeout;
      }

      xdr.ontimeout = function() {
        complete(500, 'timeout');
      };

      xdr.onload = function() {
        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
        var status = {
          code: 200,
          message: 'success'
        };
        var responses = {
          text: xdr.responseText
        };
        try {
          if (userType === 'html' || /text\/html/i.test(xdr.contentType)) {
            responses.html = xdr.responseText;
          } else if (userType === 'json' || (userType !== 'text' && /\/json/i.test(xdr.contentType))) {
            try {
              responses.json = $.parseJSON(xdr.responseText);
            } catch(e) {
              status.code = 500;
              status.message = 'parseerror';
              //throw 'Invalid JSON: ' + xdr.responseText;
            }
          } else if (userType === 'xml' || (userType !== 'text' && /\/xml/i.test(xdr.contentType))) {
            var doc = new ActiveXObject('Microsoft.XMLDOM');
            doc.async = false;
            try {
              doc.loadXML(xdr.responseText);
            } catch(e) {
              doc = undefined;
            }
            if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
              status.code = 500;
              status.message = 'parseerror';
              throw 'Invalid XML: ' + xdr.responseText;
            }
            responses.xml = doc;
          }
        } catch(parseMessage) {
          throw parseMessage;
        } finally {
          complete(status.code, status.message, responses, allResponseHeaders);
        }
      };

      // set an empty handler for 'onprogress' so requests don't get aborted
      xdr.onprogress = function(){};
      xdr.onerror = function() {
        complete(500, 'error', {
          text: xdr.responseText
        });
      };

      if (userOptions.data) {
        postData = ($.type(userOptions.data) === 'string') ? userOptions.data : $.param(userOptions.data);
      }
      xdr.open(options.type, options.url);
      xdr.send(postData);
    },
    abort: function() {
      if (xdr) {
        xdr.abort();
      }
    }
  };
});

return $;

}));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
/*! loadCSS: load a CSS file asynchronously. [c]2016 @scottjehl, Filament Group, Inc. Licensed MIT */
(function(w){
	"use strict";
	/* exported loadCSS */
	var loadCSS = function( href, before, media ){
		// Arguments explained:
		// `href` [REQUIRED] is the URL for your CSS file.
		// `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
			// By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
		// `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
		var doc = w.document;
		var ss = doc.createElement( "link" );
		var ref;
		if( before ){
			ref = before;
		}
		else {
			var refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
			ref = refs[ refs.length - 1];
		}

		var sheets = doc.styleSheets;
		ss.rel = "stylesheet";
		ss.href = href;
		// temporarily set media to something inapplicable to ensure it'll fetch without blocking render
		ss.media = "only x";

		// wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
		function ready( cb ){
			if( doc.body ){
				return cb();
			}
			setTimeout(function(){
				ready( cb );
			});
		}
		// Inject link
			// Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
			// Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
		ready( function(){
			ref.parentNode.insertBefore( ss, ( before ? ref : ref.nextSibling ) );
		});
		// A method (exposed on return object for external use) that mimics onload by polling until document.styleSheets until it includes the new sheet.
		var onloadcssdefined = function( cb ){
			var resolvedHref = ss.href;
			var i = sheets.length;
			while( i-- ){
				if( sheets[ i ].href === resolvedHref ){
					return cb();
				}
			}
			setTimeout(function() {
				onloadcssdefined( cb );
			});
		};

		function loadCB(){
			if( ss.addEventListener ){
				ss.removeEventListener( "load", loadCB );
			}
			ss.media = media || "all";
		}

		// once loaded, set link's media back to `all` so that the stylesheet applies once it loads
		if( ss.addEventListener ){
			ss.addEventListener( "load", loadCB);
		}
		ss.onloadcssdefined = onloadcssdefined;
		onloadcssdefined( loadCB );
		return ss;
	};
	// commonjs
	if( typeof exports !== "undefined" ){
		exports.loadCSS = loadCSS;
	}
	else {
		w.loadCSS = loadCSS;
	}
}( typeof global !== "undefined" ? global : this ));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
/*! loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc. (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
(function( w ){
	var loadJS = function( src, cb ){
		"use strict";
		var ref = w.document.getElementsByTagName( "script" )[ 0 ];
		var script = w.document.createElement( "script" );
		script.src = src;
		script.async = true;
		ref.parentNode.insertBefore( script, ref );
		if (cb && typeof(cb) === "function") {
			script.onload = cb;
		}
		return script;
	};
	// commonjs
	if( typeof module !== "undefined" ){
		module.exports = loadJS;
	}
	else {
		w.loadJS = loadJS;
	}
}( typeof global !== "undefined" ? global : this ));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
/*! onloadCSS: adds onload support for asynchronous stylesheets loaded with loadCSS. [c]2016 @zachleat, Filament Group, Inc. Licensed MIT */
/* global navigator */
(function(w){
	"use strict";
	
	/* exported onloadCSS */
	var onloadCSS = function( ss, callback ) {
		var called;
		function newcb(){
				if( !called && callback ){
					called = true;
					callback.call( ss );
				}
		}
		if( ss.addEventListener ){
			ss.addEventListener( "load", newcb );
		}
		if( ss.attachEvent ){
			ss.attachEvent( "onload", newcb );
		}

		// This code is for browsers that don’t support onload
		// No support for onload (it'll bind but never fire):
		//	* Android 4.3 (Samsung Galaxy S4, Browserstack)
		//	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
		//	* Android 2.3 (Pantech Burst P9070)

		// Weak inference targets Android < 4.4
	 	if( "isApplicationInstalled" in navigator && "onloadcssdefined" in ss ) {
			ss.onloadcssdefined( newcb );
		}
	};

	// commonjs
	if( typeof exports !== "undefined" ){
		exports.onloadCSS = onloadCSS;
	}
	else {
		w.onloadCSS = onloadCSS;
	}
}( typeof global !== "undefined" ? global : this ));	
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
/*jshint multistr: true */
// Wrap this as a jQuery plugin.
(function(w) { "use strict";

	/*
	 *
	 * Sorry API Client
	 *
	 * Allows basic REST based acess to the Sorry API to gather details
	 * about the page such as it's brand settings and any notices which
	 * happen to be list on the page.
	 *
	 */

	var SorryAPI = function(options) {
		// Quick self refernce to the class.
		var self = this;

		// Cache options into the class.
		// Merge in options from the defaults, followed by
		// the window object and the local hash if passed.
		self.options = $.extend({}, SorryAPI.DEFAULTS, window.SorryAPIOptions, options);
	};

	SorryAPI.DEFAULTS = {
		host: 'https://ro-api.sorryapp.com',
		version: 1
	};

	// Provide an easy accessor for the endpoint URL.
	SorryAPI.prototype.endpoint_url = function() {
		// Reference self again.
		var self = this;

		// Compile the endpoint from the host and version
		// number available in the options.
		// TODO Cater for inproperly formatted hosts and version numbrs.
		return self.options.host + '/v' + self.options.version;
	};

	// TODO: Add support for success/fail behaviour.
	SorryAPI.prototype.fetchPage = function(page_id, callback) {
		// Reference self again.
		var self = this;

		// Compile the target URL from the parameters.
		var target_url = self.endpoint_url() + '/pages/' + page_id;

		// Make a JSON request to acquire any notices to display.
		return $.ajax({
			type: "GET",
			crossDomain: true, 
			dataType: "json",
			url: target_url,
			// Set headers using beforeSend as headers: isn't supported in older jQuery.
			beforeSend: function(xhr) { xhr.setRequestHeader('X-Plugin-Ping', 'status-bar'); },
			data: { 
				include: 'brand,notices,notices.updates', // Get brand and notices in a sigle package.
				subscriber: self.options.subscriber // Pass optional subscriber configured in the client.
			},
			success: callback
		});
	};

	// commonjs
	if( typeof exports !== "undefined" ){
		exports.SorryAPI = SorryAPI;
	}
	else {
		w.SorryAPI = SorryAPI;
	}

})( typeof global !== "undefined" ? global : this );
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
