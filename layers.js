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

var AdditionalMapLayers;

{
	const osmAttr = '&copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
	const thunderforestAttr = osmAttr + ', Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>';
	const mtbMapAttr = osmAttr + ', Tiles courtesy of <a href="http://mtbmap.cz/" target="_blank">mtbmap.cz</a>';
	const freeMapSkAttr = osmAttr + ', Tiles courtesy of <a href="http://freemap.sk/" target="_blank">freemap.sk</a>';
	const mapyCzAttr = '&copy; <a href="https://www.seznam.cz/" target="_blank">Seznam.cz, a.s</a>, ' + osmAttr;
	const cuzkAttr = '&copy; <a href="http://geoportal.cuzk.cz" target="_blank">ČÚZK</a>';
	const kartverketAttr = '&copy; <a href="http://www.kartverket.no/">Kartverket</a>';
	const geoportailAttr = '&copy; <a href="https://www.geoportail.gouv.fr/">Geoportail</a>';

	AdditionalMapLayers = {
		openstreetmap: {name: "OpenStreetMap",
			url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, maxNativeZoom: 19, attribution: osmAttr}},
		opencyclemap: {name: "OpenCycleMap",
			url: "https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		transport: {name: "Transport",
			url: "https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		outdoors: {name: "Outdoors",
			url: "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png",
			opts: {maxZoom: 20, attribution: thunderforestAttr}},
		kartverket: {name: "Kartverket (Norway)",
			url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}",
			opts: {minZoom: 2, maxZoom: 20, maxNativeZoom: 18, attribution: kartverketAttr}},
		mtbmap: {name: "mtbmap.cz",
			url: "http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png",
			opts: {minZoom: 3, maxZoom: 20, maxNativeZoom: 18, attribution: mtbMapAttr}},
		freemapsk: {name: "freemap.sk",
			url: "https://outdoor.tiles.freemap.sk/{z}/{x}/{y}",
			opts: {minZoom: 3, maxZoom: 20, maxNativeZoom: 19, attribution: freeMapSkAttr}},
		mapycz: {name: "mapy.cz",
			url: "https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}",
			opts: {minZoom: 2, maxZoom: 20, maxNativeZoom: 18, attribution: mapyCzAttr}},
		mapyczbing: {name: "mapy.cz Aerial",
			url: "https://mapserver.mapy.cz/bing/{z}-{x}-{y}",
			opts: {minZoom: 2, maxZoom: 20, attribution: mapyCzAttr},
			overlay:
				{url: "https://mapserver.mapy.cz/hybrid-trail_bike-m/{z}-{x}-{y}",
					opts: {minZoom: 2, maxZoom: 20, maxNativeZoom: 18, attribution: mapyCzAttr}}},
		zmcr: {name: "Základní mapy ČR",
			url: "https://ags.cuzk.cz/arcgis/rest/services/zmwm/MapServer/tile/{z}/{y}/{x}",
			opts: {minZoom: 7, maxZoom: 20, maxNativeZoom: 18, attribution: cuzkAttr}},
		geoportail: {name: "Geoportail Aerial",
			url: "https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/geoportail/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}",
			opts: {maxZoom: 20, maxNativeZoom: 19, attribution: geoportailAttr}},
	};
}
