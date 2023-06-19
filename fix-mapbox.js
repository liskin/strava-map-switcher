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

	async function mapFromReactFiber(mapbox) {
		return await MapSwitcher.wait(function () {
			let map = null;
			mapbox?.return?.memoizedProps?.mapboxRef((m) => (map = m, m)); // edit screen
			if (!map)
				map = mapbox?.child?.memoizedProps?.value?.map; // route preview screen
			return map;
		});
	}

	function reactFiber(e) {
		const found = Object.entries(e).find(([k, _]) => k.startsWith('__reactFiber$'));
		return found ? found[1] : null;
	}

	async function patchReactMapbox(map) {

		await MapSwitcher.wait(() =>
			map.getLayer("global-heatmap") ||
			map.getLayer("personal-heatmap") ||
			map.getLayer("directional-polyline-empty-base-layer"));

		addMapSwitcherControl(map);
	}

	const mapboxReactFiber = reactFiber(this);
	if (mapboxReactFiber) {
		mapFromReactFiber(mapboxReactFiber).then(patchReactMapbox);
	}

	function addMapSwitcherControl(map) {
		class MapSwitcherControl {

			onAdd(map) {
				const preferredMap = localStorage.stravaMapSwitcherPreferred;

				this.nav = document.createElement("div");
				this.nav.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
				const select = document.createElement("select");
				select.className = "map-switcher-control-select";

				function setMapType(t) {
					clearMapSwitcherLayers(map);

					if (t && !AdditionalMapLayers[t])
						return;

					localStorage.stravaMapSwitcherPreferred = t;

					if (t) {
						clearCompositeLayers(map);
						layerFromLeaflet(map, t,
							map.getLayer("global-heatmap") ? "global-heatmap" :
								map.getLayer("personal-heatmap") ? "personal-heatmap" :
									"directional-polyline-empty-base-layer");
					}
				}

				select.addEventListener("change", e => { setMapType(e.target.value); })

				const option = document.createElement("option");
				option.value = "";
				option.text = "---";
				select.appendChild(option);

				Object.entries(AdditionalMapLayers).forEach(
					([type, l]) => {
						const option = document.createElement("option");
						option.value = type;
						option.selected = (type === preferredMap);
						option.text = l.name;
					select.appendChild(option);
				});
				this.nav.appendChild(select);

				if (preferredMap)
					setTimeout(() => setMapType(preferredMap));

				return this.nav;
			}

			onRemove() {
				this.nav.parentNode.removeChild(this.nav);
			}
		}

		map.addControl(new MapSwitcherControl(), "top-right");
	}
});
