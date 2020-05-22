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

document.arrive(".mapboxgl-map", {onceOnly: false, existing: true}, function () {
	const donation = jQuery('<a href="https://www.paypal.me/lisknisi/10EUR">♥=€ strava-map-switcher</a>');

	function tilesFromLeaflet(l) {
		if (l.url.includes("{s}")) {
			const subdomains = l.subdomains ? l.subdomains : "abc";
			return [...subdomains].map(s => l.url.replace("{s}", s));
		} else {
			return [l.url];
		}
	}

	function sourceFromLeaflet(l) {
		const s = {
			type: "raster",
			tiles: tilesFromLeaflet(l),
			minzoom: l.opts.minZoom ? l.opts.minZoom : 0,
			maxzoom: l.opts.maxNativeZoom ? l.opts.maxNativeZoom : l.opts.maxZoom ? l.opts.maxZoom : 18,
			tileSize: 256,
			attribution: l.opts.attribution,
		};
		return s;
	}

	function layerFromLeaflet(map, type, l, before) {
		if (l.overlay) {
			const s = `${type}_overlay`;
			if (!map.getSource(s))
				map.addSource(s, sourceFromLeaflet(l.overlay));
			map.addLayer({id: "map-switcher-overlay", type: "raster", source: s}, before);
		}

		if (!map.getSource(type))
			map.addSource(type, sourceFromLeaflet(l));
		map.addLayer({id: "map-switcher", type: "raster", source: type}, l.overlay ? "map-switcher-overlay" : before);
	}

	// heatmap
	if (window.jQuery && window.map && window.idleEvent) {
		let mapType = null;

		const origIdleEvent = idleEvent;
		idleEvent = function () {
			origIdleEvent();

			if (!map.getLayer("map-switcher") && mapType)
				layerFromLeaflet(map, mapType, AdditionalMapLayers[mapType], "heat");
		};

		function setMapType(t) {
			if (t && !AdditionalMapLayers[t])
				return;

			localStorage.stravaMapSwitcherHeatmapPreferred = t;
			mapType = t;
			state.prevStyle = null;
			updateMapStyles();
		}

		const preferredMap = localStorage.stravaMapSwitcherHeatmapPreferred;

		const sidebar = jQuery('#js-sidebar-content div.section:first');
		sidebar.append(jQuery('<h5>Maps</h5>'));

		const select = jQuery('<select>');
		select.change(e => setMapType(e.target.value));
		select.append(jQuery(`<option value="">`).text("---"));
		Object.entries(AdditionalMapLayers).forEach(
			([type, l]) => select.append(jQuery(`<option value="${type}" ${type == preferredMap ? "selected" : ""}>`).text(l.name)));
		sidebar.append(jQuery('<div>').append(select));

		sidebar.append(jQuery('<div>').append(donation));

		if (preferredMap) {
			setTimeout(() => setMapType(preferredMap));
		}
	}
});
