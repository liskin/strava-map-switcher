/*
 * Map switcher for Strava website.
 *
 * Copyright © 2016 Tomáš Janoušek.
 *
 * BOOKMARKLET:
 *
 *  javascript:jQuery('body').append(jQuery("<script src='https://rawgit.com/liskin/strava-map-switcher/master/fix.js'></script>"));void(0);
 *
 * LICENSE:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function(){
	if (!document.getElementById("map-type-control")) {
		return;
	}

	Strava.Maps.Mapbox.Base.mapIds.runbikehike_id = "mapbox.run-bike-hike";

	var layerNames =
		{terrain: Strava.I18n.Locale.t("strava.maps.google.custom_control.terrain")
		,standard: Strava.I18n.Locale.t("strava.maps.google.custom_control.standard")
		,satellite: Strava.I18n.Locale.t("strava.maps.google.custom_control.satellite")
		,runbikehike: "Run/Bike/Hike"
		,openstreetmap: "OpenStreetMap"
		,opencyclemap: "OpenCycleMap"
		,transport: "Transport"
		,outdoors: "Outdoors"
		,mtbmap: "mtbmap.cz"
		,mapycz: "mapy.cz"
		,mapyczbing: "mapy.cz Aerial"
		,googlesatellite: "Google Satellite"
		,googleroadmap: "Google Road Map"
		,googlehybrid: "Google Hybrid"
		,googleterrain: "Google Terrain"
		};

	Strava.Maps.CustomControlView.prototype.handleMapTypeSelector = function(t) {
		var e, i, r;
		return(
			e = this.$$(t.target),
			r = e.data("map-type-id"),
			i = this.$("#selected-map").data("map-type-id"),
			e.data("map-type-id", i),
			e.html(layerNames[i]),
			this.$("#selected-map").data("map-type-id", r),
			this.$("#selected-map").html(layerNames[r]),
			this.changeMapType(r)
		);
	};

	function htmlToElement(html) {
		var template = document.createElement('template');
		template.innerHTML = html;
		return template.content.firstChild;
	}

	var opts = document.getElementById("map-type-control").getElementsByClassName("options")[0];
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="runbikehike">Run/Bike/Hike</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="openstreetmap">OpenStreetMap</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="opencyclemap">OpenCycleMap</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="transport">Transport</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="outdoors">Outdoors</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="mtbmap">mtbmap.cz</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="mapycz">mapy.cz</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="mapyczbing">mapy.cz Aerial</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="googlesatellite">Google Satellite</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="googleroadmap">Google Road Map</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="googlehybrid">Google Hybrid</a></li>'));
	opts.appendChild(htmlToElement('<li><a class="map-type-selector" data-map-type-id="googleterrain">Google Terrain</a></li>'));

	var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
	var thunderforestAttr = osmAttr + ', Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>';
	var mtbMapAttr = osmAttr + ', Tiles courtesy of <a href="http://mtbmap.cz/" target="_blank">mtbmap.cz</a>';
	var mapyCzAttr = '&copy; Seznam.cz, a.s, ' + osmAttr;
	function createOpenStreetMapLayer() {
		return L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: osmAttr});
	}
	function createOpenCycleMapLayer() {
		//return L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {attribution: ""});
		return L.tileLayer("https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png", {attribution: thunderforestAttr});
	}
	function createTransportLayer() {
		return L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png", {attribution: thunderforestAttr});
	}
	function createOutdoorsLayer() {
		return L.tileLayer("https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png", {attribution: thunderforestAttr});
	}
	function createMtbMapLayer() {
		return L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {attribution: mtbMapAttr});
	}
	function createMapyCzLayer() {
		return L.tileLayer("https://m{s}.mapserver.mapy.cz/wturist-m/{z}-{x}-{y}",
			{minZoom: 2, maxZoom: 18, subdomains: "1234", attribution: mapyCzAttr});
	}
	function createMapyCzBingLayer() {
		var bing = L.tileLayer("https://m{s}.mapserver.mapy.cz/bing/{z}-{x}-{y}",
			{minZoom: 2, maxZoom: 20, subdomains: "1234", attribution: mapyCzAttr});
		var overlay = L.tileLayer("https://m{s}.mapserver.mapy.cz/hybrid-trail_bike-m/{z}-{x}-{y}",
			{minZoom: 2, maxZoom: 18, subdomains: "1234", attribution: mapyCzAttr});
		return L.layerGroup([bing, overlay]);
	}

	var once = true;
	Strava.Maps.Mapbox.CustomControlView.prototype.changeMapType = function(t){
		var map = this.map();

		if (once) {
			once = false;

			map.layers.runbikehike = map.createLayer("run-bike-hike");
			map.layers.openstreetmap = createOpenStreetMapLayer();
			map.layers.opencyclemap = createOpenCycleMapLayer();
			map.layers.transport = createTransportLayer();
			map.layers.outdoors = createOutdoorsLayer();
			map.layers.mtbmap = createMtbMapLayer();
			map.layers.mapycz = createMapyCzLayer();
			map.layers.mapyczbing = createMapyCzBingLayer();
			google.load("maps", "3.9", {"other_params":"sensor=false&libraries=geometry,places&client=gme-stravainc1", callback: function(){
				jQuery.getScript('https://cdn.rawgit.com/shramov/leaflet-plugins/master/layer/tile/Google.js').done(function() {
					map.layers.googlesatellite = new L.Google('SATELLITE');
					map.layers.googleroadmap = new L.Google('ROADMAP');
					map.layers.googlehybrid = new L.Google('HYBRID');
					map.layers.googleterrain = new L.Google('TERRAIN');
				});
			}});

			this.delegateEvents();
		}

		return map.setLayer(t);
	};

	// make sure delegateEvents is run at least once
	opts.children[0].children[0].click();
})()
