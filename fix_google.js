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
				var r = Strava.Maps.Google.Overlays.Overlay.getNormalizedCoordinates(coord, zoom);
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
});
