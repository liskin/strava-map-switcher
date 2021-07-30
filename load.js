/*
 * Map switcher for Strava website.
 *
 * Copyright © 2016 Tomáš Janoušek.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

{
	const baseUrl = document.currentScript.src.match('^[a-z-]+://.*/') + '';
	const getURL = (path) => baseUrl + path;

	const ignoreError = (promise) => new Promise(resolve => { promise.then(resolve, resolve); null; });

	const getScript = (url) => new Promise(function (resolve, reject) {
		const s = document.createElement('script');
		s.src = url;
		s.async = true;
		s.type = 'text/javascript';
		s.onerror = reject;
		s.onload = resolve;
		document.body.appendChild(s);
	});

	const getCSS = function (url) {
		const s = document.createElement('link');
		s.href = url;
		s.rel = 'stylesheet';
		document.head.appendChild(s);
	};

	const loadJQuery = () => window.jQuery
		? Promise.resolve(null)
		: getScript(getURL('3rd/jquery-3.5.1.min.js')).then(() => jQuery.noConflict());
	const loadGoogleMaps = () => document.querySelector('script[src*="//maps.google.com/maps/api/js"]')
		? Promise.resolve(null)
		: getScript('https://maps.google.com/maps/api/js?sensor=true&client=gme-stravainc1');
	const loadGoogleMutant = () => (window.L && window.L.Class)
		? getScript(getURL('3rd/Leaflet.GoogleMutant.js'))
		: Promise.resolve(null);

	loadJQuery().then(() => Promise.all([
		getScript(getURL('arrive.min.js')),
		getScript(getURL('common.js')),
		getScript(getURL('layers.js')),
		getScript(getURL('donation.js')),
		ignoreError(loadGoogleMaps().then(() => Promise.all([
			loadGoogleMutant(),
			getScript(getURL('3rd/leaflet-pegman.min.js')),
			getCSS(getURL('3rd/leaflet-pegman.min.css')),
		]))),
	])).then(function () {
		getScript(getURL('fix.js'));
		getScript(getURL('fix-mapbox.js'));
	});
}
