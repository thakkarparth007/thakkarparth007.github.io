/*
	Include this script in the page where you want to use the FB api.
	(found on thakkarparth007.github.io)

	The following code includes an invisible iframe pointing to the "/fb-api-iframe-hack.html"
	page, located at the specified host. The "specified host" must be the url given 
	as the parameter to FB.loadAPI() function. The "specified host" is specified (sic) via the 
	`app_url` option to the FB.init() method. 
	The code also creates a stub FB object and then uses window.postMessage 
	to deal with the FB api, which is loaded in the iframe. This hacky approach 
	is required because loading the FB api in any page is easy, however, one can't
	use the api on any page, if the host specified in the app settings on FB 
	doesn't match the current location's host. 

	Refer:
		http://brianmayer.com/2012/12/building-a-chrome-extension-that-connects-to-a-facebook-app/

	Beautiful thing.
 */

(function() {
	// map of callid to original callback function
	var cb_account = {};
	var FB = {};
	var iframe_origin = '';

	FB.loadAPI = function(app_url) {
		iframe_origin = app_url + (app_url.lastIndexOf('/') == app_url.length-1 ? '' : '/');
		elt = document.createElement('iframe');
		elt.id = 'facebook_load_frame';
		elt.src = iframe_origin + 'fb-api-iframe-hack.html?app_url=' + encodeURIComponent(app_url) + 
								  '&original_origin=' + encodeURIComponent(window.location.origin);
		document.getElementsByTagName('body')[0].appendChild(elt);
	};

	/*// app_url = the url given in the FB app settings
	FB.init = function(options) { // this could be done faster with the livequery() plugin for jquery
		var queryString = "?";
		var props = Object.getOwnProperties(options);
		for(var i in props) {
			queryString += props[i] + "=" + encodeURIComponent(options[props[i]]) + "&";
		}
	};*/

	var api = ["__globalCallbacks", "api", "AppEvents", "getLoginStatus", "getAuthResponse", "init",
			   "getAccessToken", "getUserID", "login", "logout", "Canvas", "Event", "Frictionless", "ui", "XFBML"];
	for(var k in api) {
		(function(key) {
			FB[key] = function() {
				var cb = Array.prototype.splice.call(arguments, -1);
				var callid = Date.now() + Math.random();
				cb_account[callid] = cb;

				// send the message to the iframe so that the ACTUAL FB object can do its work.
				window.postMessage({
					fn: key,
					callid: callid,
					args: Array.arguments
				}, iframe_origin);
			};
		})(api[k]);
	}

	// iframe sends a message - response to some previous call.
	window.addEventListener('message', function(e) {
		// call the window.fbAsyncInit method when the iframe says it's loaded 
		// the api.
		if(e.data.event == 'fb-iframe-hack:init') {
			window.fbAsyncInit();
		}
		else if(e.data.event == 'fb-iframe-hack:response') {
			cb_account[e.data.callid].apply(this, e.data.cbArgs);
			delete cb_account[e.data.callid];
		}
		// else, ignore
	});

	window.FB = FB;
})();