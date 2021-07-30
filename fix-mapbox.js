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

document.arrive(".mapboxgl-map", {onceOnly: false, existing: true, fireOnAttributesModification: true}, function () {
	if (this.mapSwitcherDone) return;
	this.mapSwitcherDone = true;

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

	function layerFromLeaflet(map, type, before) {
		const l = AdditionalMapLayers[type];

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

	function clearMapSwitcherLayers(map) {
		if (map.getLayer("map-switcher-overlay"))
			map.removeLayer("map-switcher-overlay");
		if (map.getLayer("map-switcher"))
			map.removeLayer("map-switcher");
	}

	function clearCompositeLayers(map) {
		map.getStyle().layers.filter(l => l.source == "composite").map(l => l.id).forEach(l => map.removeLayer(l));
	}

	// heatmap
	if (window.map && window.idleEvent) {
		let mapType = null;

		const origMapAddLayer = map.addLayer;
		map.addLayer = function (...args) {
			const ret = origMapAddLayer.call(this, ...args);

			// workaround for an error in Strava's addHeatLayer() which throws
			// an exception before getting to the idleEvent() call
			if (map.style.sourceCaches === undefined) {
				const source = sourceName();
				map.style.sourceCaches = {};
				map.style.sourceCaches[source] = {
					_source: {
						attribution: ''
					}
				};
			}

			return ret;
		};

		const origIdleEvent = idleEvent;
		idleEvent = function () {
			origIdleEvent();

			try {
				if (!map.getLayer("map-switcher") && mapType) {
					clearMapSwitcherLayers(map);
					layerFromLeaflet(map, mapType, "heat");
				}
			} catch (e) {
				console.log(`idleEvent: ${e}`);
			}
		};

		function setMapType(t) {
			if (t && !AdditionalMapLayers[t])
				return;

			localStorage.stravaMapSwitcherPreferred = t;
			mapType = t;
			state.prevStyle = null;
			updateMapStyles();
		}

		const preferredMap = localStorage.stravaMapSwitcherPreferred;

		const sidebar = jQuery('#js-sidebar-content div.section:first');
		sidebar.append(jQuery('<h5>Maps</h5>'));

		const select = jQuery('<select>');
		select.change(e => setMapType(e.target.value));
		select.append(jQuery(`<option value="">`).text("---"));
		Object.entries(AdditionalMapLayers).forEach(
			([type, l]) => select.append(jQuery(`<option value="${type}" ${type == preferredMap ? "selected" : ""}>`).text(l.name)));
		sidebar.append(jQuery('<div>').append(select));

		if (MapSwitcherDonation)
			sidebar.append(jQuery('<div>').append(MapSwitcherDonation));

		if (preferredMap)
			setTimeout(() => setMapType(preferredMap));
	}

	function reactInternalInstance(e) {
		const found = Object.entries(e).find(([k, _]) => k.startsWith('__reactInternalInstance$'));
		return found ? found[1] : null;
	}

	async function mapFromReactInternalInstance(mapbox) {
		return await MapSwitcher.wait(function () {
			let map = null;
			mapbox?.return?.memoizedProps?.mapboxRef((m) => (map = m, m));
			return map;
		});
	}

	function reactFiber(e) {
		const found = Object.entries(e).find(([k, _]) => k.startsWith('__reactFiber$'));
		return found ? found[1] : null;
	}

	async function mapFromReactFiber(mapbox) {
		return await MapSwitcher.wait(() => mapbox?.pendingProps?.children?.props?.value?.map);
	}

	async function patchReactMapbox(map) {
		await MapSwitcher.wait(() => map.getLayer("global-heatmap") || map.getLayer("personal-heatmap"));

		function setMapType(t) {
			if (t && !AdditionalMapLayers[t])
				return;

			clearMapSwitcherLayers(map);
			localStorage.stravaMapSwitcherPreferred = t;

			if (t) {
				clearCompositeLayers(map);
				layerFromLeaflet(map, t,
					map.getLayer("global-heatmap") ? "global-heatmap" :
					map.getLayer("personal-heatmap") ? "personal-heatmap" :
					"z-index-1");
			}
		}

		const preferredMap = localStorage.stravaMapSwitcherPreferred;

		const nav = jQuery('<div>').css({
			"position": "absolute",
			"top": 0,
			"left": 0,
			"right": 0,
			"margin-left": "auto",
			"margin-right": "auto",
			"width": "30em",
			"padding": "1ex",
			"background-color": "#ddd",
			"border": "1px solid #888",
		});

		const select = jQuery('<select>');
		select.change(e => setMapType(e.target.value));
		select.append(jQuery(`<option value="">`).text("---"));
		Object.entries(AdditionalMapLayers).forEach(
			([type, l]) => select.append(jQuery(`<option value="${type}" ${type == preferredMap ? "selected" : ""}>`).text(l.name)));
		nav.append(select);

		if (MapSwitcherDonation) {
			nav.append(jQuery('<span>&emsp;</span>'));
			nav.append(MapSwitcherDonation);
		}

		jQuery('body').append(nav);

		if (preferredMap)
			setTimeout(() => setMapType(preferredMap));
	}

	const mapboxReactInternalInstance = reactInternalInstance(this);
	if (mapboxReactInternalInstance) {
		mapFromReactInternalInstance(mapboxReactInternalInstance).then(patchReactMapbox);
	}

	const mapboxReactFiber = reactFiber(this);
	if (mapboxReactFiber) {
		mapFromReactFiber(mapboxReactFiber).then(patchReactMapbox);
	}
});
