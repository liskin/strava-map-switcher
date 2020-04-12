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
	const baseUrl = document.currentScript.src.match("^[a-z-]+://.*/") + "";
	const getURL = (path) => baseUrl + path;

	const ignoreError = function (deferred) {
		const newDeferred = jQuery.Deferred();
		deferred.always(newDeferred.resolve);
		return newDeferred.promise();
	};

	jQuery.when(
		jQuery.getScript(getURL('arrive.min.js')),
		jQuery.getScript(getURL('layers.js')),
		ignoreError(jQuery.getScript("https://maps.google.com/maps/api/js?sensor=true&client=gme-stravainc1")).then(
			() => jQuery.getScript(getURL('Google.js')).promise()),
	).then(function () {
		jQuery.getScript(getURL('fix.js'));
	});
}
