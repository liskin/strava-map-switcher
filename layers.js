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

var AdditionalMapLayers = (function(){
	var osmAttr = '&copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
	var thunderforestAttr = osmAttr + ', Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>';
	var mtbMapAttr = osmAttr + ', Tiles courtesy of <a href="http://mtbmap.cz/" target="_blank">mtbmap.cz</a>';
	var mapyCzAttr = '&copy; <a href="https://www.seznam.cz/" target="_blank">Seznam.cz, a.s</a>, ' + osmAttr;
	var cuzkAttr = '&copy; <a href="http://geoportal.cuzk.cz" target="_blank">ČÚZK</a>';
	return [
		{type: "openstreetmap", name: "OpenStreetMap",
			url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, maxNativeZoom: 19, attribution: osmAttr}},
		{type: "opencyclemap", name: "OpenCycleMap",
			url: "https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		{type: "transport", name: "Transport",
			url: "https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		{type: "outdoors", name: "Outdoors",
			url: "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		{type: "mtbmap", name: "mtbmap.cz",
			url: "http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png",
			opts: {minZoom: 3, maxZoom: 20, maxNativeZoom: 18, attribution: mtbMapAttr}},
		{type: "mapycz", name: "mapy.cz",
			url: "https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}",
			opts: {minZoom: 2, maxZoom: 20, maxNativeZoom: 18, attribution: mapyCzAttr}},
		{type: "mapyczbing", name: "mapy.cz Aerial",
			url: "https://m{s}.mapserver.mapy.cz/bing/{z}-{x}-{y}",
			opts: {minZoom: 2, maxZoom: 20, subdomains: "1234", attribution: mapyCzAttr},
			overlay:
				{url: "https://m{s}.mapserver.mapy.cz/hybrid-trail_bike-m/{z}-{x}-{y}",
					opts: {minZoom: 2, maxZoom: 20, maxNativeZoom: 18, subdomains: "1234", attribution: mapyCzAttr}}},
		{type: "zmcr", name: "Základní mapy ČR",
			url: "http://ags.cuzk.cz/arcgis/rest/services/zmwm/MapServer/tile/{z}/{y}/{x}",
			opts: {minZoom: 7, maxZoom: 20, maxNativeZoom: 18, attribution: cuzkAttr}},
	];
})();
