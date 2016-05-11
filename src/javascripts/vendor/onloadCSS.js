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