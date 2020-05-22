# Map switcher for Strava website

Adds additional maps to Strava.com:

 - [OpenStreetMap](https://www.openstreetmap.org/)
 - [Thunderforest Maps](http://www.thunderforest.com/maps/): OpenCycleMap, Transport, Outdoors
 - [mtbmap.cz](http://mtbmap.cz/)
 - [mapy.cz](https://mapy.cz/)
 - [freemap.sk](https://www.freemap.sk/)
 - [Google Maps](https://maps.google.com/)
 - …

## Donations (♥ = €)

If you like this extension and wish to support its development and maintenance
(Strava website changes and this extension must adapt to continue functioning),
please consider [a small donation](https://www.paypal.me/lisknisi/10EUR).

## Installation

 - [Chrome Web Store](https://chrome.google.com/webstore/detail/strava-map-switcher/djcheclpmmkcdkjcenfamalobdenmici)
 - [Firefox Addons](https://addons.mozilla.org/cs/firefox/addon/strava-map-switcher/)
 - [user script](https://cdn.jsdelivr.net/gh/liskin/strava-map-switcher@master/greasemonkey.user.js)
   ([ViolentMonkey](https://violentmonkey.github.io/get-it/),
   [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/))

## Bookmarklet

If you can't or don't want to use the addon/userscript, it works as a bookmarklet too:

    javascript:{const s = document.createElement("script"); s.src = 'https://rawgit.com/liskin/strava-map-switcher/master/load.js'; s.type = 'text/javascript'; document.body.appendChild(s);};void(0);
