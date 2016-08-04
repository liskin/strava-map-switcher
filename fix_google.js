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

var FixGoogleScript = document.currentScript;
jQuery.getScript(FixGoogleScript.dataset.layersUrl).done(function(){
	var overlays = {};

	// Normalizes the coords that tiles repeat across the x axis (horizontally)
	// like the standard Google map tiles.
	function getNormalizedCoord(coord, zoom) {
		var y = coord.y;
		var x = coord.x;

		// tile range in one direction range is dependent on zoom level
		// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
		var tileRange = 1 << zoom;

		// don't repeat across y-axis (vertically)
		if (y < 0 || y >= tileRange) {
			return null;
		}

		// repeat across x-axis
		if (x < 0 || x >= tileRange) {
			x = (x % tileRange + tileRange) % tileRange;
		}

		return {x: x, y: y};
	}

	function tileLayer(l) {
		if (l.overlay) {
			overlays["x-" + l.type] = tileLayer(l.overlay);
		}

		var minZoom = l.opts.minZoom || 0;
		var maxZoom = l.opts.maxNativeZoom || l.opts.maxZoom || 18;
		var tileSize = l.opts.tileSize || 256;
		var subdomains = l.opts.subdomains || "abc";
		var url = l.url.replace(/{/g, '{{').replace(/}/g, '}}');
		return new google.maps.ImageMapType({
			getTileUrl: function(coord, zoom) {
				var r = getNormalizedCoord(coord, zoom);
				if (r) {
					r.s = subdomains[(r.x + r.y) % subdomains.length];
					r.z = zoom;
					return _.template(url)(r);
				} else {
					return null;
				}
			},
			tileSize: new google.maps.Size(tileSize, tileSize),
			opacity: 1,
			maxZoom: maxZoom,
			minZoom: minZoom
		});
	}

	var once = true;
	if (Strava.Routes) {
		var old_setMapStyle = Strava.Routes.MapViewOptionsView.prototype.setMapStyle;
		Strava.Routes.MapViewOptionsView.prototype.setMapStyle = function(t){
			var g = this.map.google;

			if (once) {
				once = false;

				AdditionalMapLayers.forEach(l => g.mapTypes.set("x-" + l.type, tileLayer(l)));
			}

			localStorage.stravaMapSwitcherRouteBuilderPreferred = t;
			g.overlayMapTypes.clear();
			if (t.startsWith("x-")) {
				if (overlays[t]) {
					g.overlayMapTypes.push(overlays[t]);
				}
				return g.setMapTypeId(t);
			} else {
				return old_setMapStyle.call(this, t);
			}
		};
	}

	var opts = jQuery('#view-options li.map-style div.switches');
	if (opts) {
		opts.css({display: 'block', position: 'relative'});
		AdditionalMapLayers.forEach(l => opts.append(jQuery("<div class='button btn-xs' data-value='x-" + l.type + "' tabindex='0'>" + l.name + "</div>")));
		opts.children().css({display: 'block', width: '100%'});

		var preferredMap = localStorage.stravaMapSwitcherRouteBuilderPreferred;
		if (preferredMap) {
			opts.children().filter((_, e) => jQuery(e).data("value") === preferredMap).click();
		}
	}

	if (!window._stravaExplorer) {
		var explorerScript = jQuery('body').children().filter((_, e) => e.innerHTML.includes("var stravaExplorer"))[0];
		if (explorerScript) {
			try {
				eval(explorerScript.innerHTML.replace(/var stravaExplorer =/, 'var stravaExplorer = window._stravaExplorer =') + "\nconsole.log('ZZZ');")
			} catch (e) {
			};

			var e = window._stravaExplorer;

			AdditionalMapLayers.forEach(l => e.map.mapTypes.set("x-" + l.type, tileLayer(l)));

			// reset map so it doesn't point in the middle of the ocean
			jQuery("#segment-map-filters form").trigger("submit");
			e.navigation.search();

			function setMapType(t) {
				localStorage.stravaMapSwitcherSegmentExplorerPreferred = t;
				e.map.overlayMapTypes.clear();
				if (overlays[t]) {
					e.map.overlayMapTypes.push(overlays[t]);
				}
				return e.map.setMapTypeId(t);
			}

			var nav = jQuery('#segment-map-filters');
			nav.css({height: 'auto'});
			var clr = jQuery('<div>');
			clr.css({clear: 'both', "margin-bottom": '1em'});
			nav.append(clr);
			AdditionalMapLayers.forEach(l => {
				var b = jQuery("<div class='button btn-xs'>" + l.name + "</div>");
				b.click(() => { setMapType("x-" + l.type); });
				clr.append(b);
			});

			var preferredMap = localStorage.stravaMapSwitcherSegmentExplorerPreferred;
			if (preferredMap) {
				setTimeout(() => { setMapType(preferredMap); });
			}
		}
	}
});
