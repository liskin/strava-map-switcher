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

var FixScript = document.currentScript;
jQuery.getScript(FixScript.dataset.layersUrl).done(function(){
	function tileLayer(l) {
		var r = L.tileLayer(l.url, l.opts);
		if (l.overlay) {
			var o = L.tileLayer(l.overlay.url, l.overlay.opts);
			r = L.layerGroup([r, o]);
		}
		return r;
	}

	function addLayers(map) {
		map.layers.runbikehike = map.createLayer("run-bike-hike");
		AdditionalMapLayers.forEach(l => map.layers[l.type] = tileLayer(l));
		if (window.google) {
			window.google.load("maps", "3.9", {"other_params":"sensor=false&libraries=geometry,places&client=gme-stravainc1", callback: function(){
				//'https://cdn.rawgit.com/shramov/leaflet-plugins/master/layer/tile/Google.js'
				jQuery.getScript(FixScript.dataset.googleJsUrl).done(function() {
					map.layers.googlesatellite = new L.Google('SATELLITE');
					map.layers.googleroadmap = new L.Google('ROADMAP');
					map.layers.googlehybrid = new L.Google('HYBRID');
					map.layers.googleterrain = new L.Google('TERRAIN');
				});
			}});
		}
	}

	Strava.Maps.Mapbox.Base.mapIds.runbikehike_id = "mapbox.run-bike-hike";

	var layerNames =
		{terrain: Strava.I18n.Locale.t("strava.maps.google.custom_control.terrain")
		,standard: Strava.I18n.Locale.t("strava.maps.google.custom_control.standard")
		,satellite: Strava.I18n.Locale.t("strava.maps.google.custom_control.satellite")
		,runbikehike: "Run/Bike/Hike"
		,googlesatellite: "Google Satellite"
		,googleroadmap: "Google Road Map"
		,googlehybrid: "Google Hybrid"
		,googleterrain: "Google Terrain"
		};
	AdditionalMapLayers.forEach(l => layerNames[l.type] = l.name);

	var activityOpts = jQuery('#map-type-control .options');
	if (activityOpts.length) {
		Strava.Maps.CustomControlView.prototype.handleMapTypeSelector = function(t) {
			var e, i, r;
			return(
				e = this.$$(t.target),
				r = e.data("map-type-id"),
				i = this.$("#selected-map").data("map-type-id"),
				e.data("map-type-id", i),
				e.text(layerNames[i]),
				this.$("#selected-map").data("map-type-id", r),
				this.$("#selected-map").text(layerNames[r]),
				this.changeMapType(r)
			);
		};

		var once = true;
		Strava.Maps.Mapbox.CustomControlView.prototype.changeMapType = function(t){
			var map = this.map();

			if (once) {
				once = false;

				addLayers(map);

				// this is needed for the right handleMapTypeSelector to be called
				this.delegateEvents();
			}

			localStorage.stravaMapSwitcherPreferred = t;
			return map.setLayer(t);
		};

		var optsToAdd = [];
		optsToAdd.push(
			{type: "runbikehike", name: "Run/Bike/Hike"});
		AdditionalMapLayers.forEach(l => optsToAdd.push({type: l.type, name: l.name}));
		optsToAdd.push(
			{type: "googlesatellite", name: "Google Satellite"},
			{type: "googleroadmap", name: "Google Road Map"},
			{type: "googlehybrid", name: "Google Hybrid"},
			{type: "googleterrain", name: "Google Terrain"});
		optsToAdd.forEach(o => activityOpts.append(jQuery('<li>').append(jQuery('<a class="map-type-selector">').data("map-type-id", o.type).text(o.name))));

		var preferredMap = localStorage.stravaMapSwitcherPreferred;

		// make sure delegateEvents is run at least once
		activityOpts.find(':first a').click();
		activityOpts.removeClass("open-menu");
		activityOpts.parent().removeClass("active");

		// select preferred map type
		if (preferredMap) {
			var mapLinks = activityOpts.find('a.map-type-selector');
			mapLinks.filter((_, e) => jQuery(e).data("map-type-id") === preferredMap).click();
			activityOpts.removeClass("open-menu");
			activityOpts.parent().removeClass("active");
		}
	}

	var explorerMapFilters = jQuery('#segment-map-filters form');
	if (explorerMapFilters.length) {
		var once = false;
		function explorerFound(e) {
			if (once)
				return;
			once = true;

			addLayers(e.map);

			function setMapType(t) {
				localStorage.stravaMapSwitcherSegmentExplorerPreferred = t;
				e.map.setLayer(t);
			}

			var nav = jQuery('#segment-map-filters');
			nav.css({height: 'auto'});
			var clr = jQuery('<div>');
			clr.css({clear: 'both', "margin-bottom": '1em'});
			nav.append(clr);
			function addButton(name, type) {
				var b = jQuery("<div class='button btn-xs'>").text(name);
				b.click(() => { setMapType(type); });
				clr.append(b);
			}
			addButton("Standard", "standard");
			addButton("Terrain", "terrain");
			addButton("Satellite", "satellite");
			addButton("Run/Bike/Hike", "runbikehike");
			AdditionalMapLayers.forEach(l => addButton(l.name, l.type));
			addButton("Google Satellite", "googlesatellite");
			addButton("Google Road Map", "googleroadmap");
			addButton("Google Hybrid", "googlehybrid");
			addButton("Google Terrain", "googleterrain");
			addButton("Geoportail", "geoportail");

			var preferredMap = localStorage.stravaMapSwitcherPreferred;
			if (preferredMap) {
				setTimeout(() => { setMapType(preferredMap); });
			}
		}

		var old_navigate = Strava.Explorer.Navigation.prototype.navigate;
		Strava.Explorer.Navigation.prototype.navigate = function(){
			old_navigate.call(this);
			explorerFound(this.explorer);
			Strava.Explorer.Navigation.prototype.navigate = old_navigate;
		};
		explorerMapFilters.trigger('submit');
	}

	var routeBuilderOpts = jQuery('#view-options li.map-style div.switches');
	if (routeBuilderOpts.length) {
		var once = true;
		Strava.Routes.MapViewOptionsView.prototype.setMapStyle = function(t){
			var map = this.map;

			if (once) {
				once = false;

				addLayers(map);
			}

			localStorage.stravaMapSwitcherPreferred = t;
			return map.setLayer(t);
		};

		var preferredMap = localStorage.stravaMapSwitcherPreferred;

		// change map so that our setMapStyle is called
		routeBuilderOpts.find('div:last').click();

		routeBuilderOpts.css({display: 'block', position: 'relative'});
		AdditionalMapLayers.forEach(l =>
			routeBuilderOpts.append(
				jQuery("<div class='button btn-xs' tabindex='0'>").data("value", l.type).text(l.name)
			)
		);
		routeBuilderOpts.children().css({display: 'block', width: '100%'});

		if (preferredMap) {
			routeBuilderOpts.children().filter((_, e) => jQuery(e).data("value") === preferredMap).click();
		}
	}
});
