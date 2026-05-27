/*
 * Map switcher for Strava website - Fatmap/MRE engine support.
 */
{
    // WASM-Exceptions aus dem Emscripten-Render-Loop abfangen,
    // damit der Route Builder bei nicht erreichbaren Tile-Layern nicht abstürzt
    const _raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => _raf((...args) => {
        try { cb(...args); }
        catch(e) {
            if (typeof e === 'number') {
                console.warn('[MapSwitcher] WASM exception unterdrückt:', e);
            } else {
                throw e;
            }
        }
    });

    function getFreshEngine() {
        const canvas = document.querySelector('canvas[data-testid="mre-canvas"]');
        if (!canvas) return null;
        const fiberKey = Object.keys(canvas).find(k => k.startsWith('__react'));
        if (!fiberKey) return null;
        let node = canvas[fiberKey];
        for (let i = 0; i < 50; i++) {
            node = node?.return;
            if (!node) break;
            const val = node?.memoizedProps?.value;
            if (val?.terrainEngine) return val.terrainEngine;
        }
        return null;
    }

    async function getFatmapEngine() {
        return await MapSwitcher.wait(getFreshEngine);
    }

    async function patchFatmap() {
        const te = await getFatmapEngine();
        const ts = te.getTileSources();
        const originalUrls = {};
        ts.getTileSources().forEach(s => { originalUrls[s.name] = s.templateUrl; });

        let currentKey = null;

        function setLayer(key) {
            const layer = AdditionalMapLayers[key];
            if (!layer) return;
            try {
                ts.setTileSourceTemplateUrl('winter-overlay-imagery', layer.url);
                getFreshEngine().getDebugApi().clearCache();
                getFreshEngine().setMapType(2);
                getFreshEngine().requestRender();
                currentKey = key;
            } catch (e) {
                console.warn('[MapSwitcher] setLayer failed:', e);
                // restore previous layer if available, otherwise fallback to original URL
                if (currentKey && currentKey !== key) {
                    try {
                        const prev = AdditionalMapLayers[currentKey];
                        if (prev) ts.setTileSourceTemplateUrl('winter-overlay-imagery', prev.url);
                    } catch (_) {}
                } else {
                    // no previous layer – restore original URL
                    try {
                        ts.setTileSourceTemplateUrl('winter-overlay-imagery', originalUrls['winter-overlay-imagery']);
                    } catch (_) {}
                }
            }
        }

        // --- Container ---
        const container = document.createElement('div');
        container.id = 'map-switcher-fatmap';
        container.style.cssText = [
            'position:absolute', 'top:70px', 'right:10px', 'z-index:1000',
            'background:white', 'border-radius:4px',
            'box-shadow:0 2px 6px rgba(0,0,0,0.3)', 'font-size:12px',
            'max-height:80vh', 'min-width:160px', 'overflow:hidden',
        ].join(';');

        // --- Donation-Link ---
        function makeDonationLink() {
            const lastClick = localStorage.stravaMapSwitcherLastDonationClick;
            const clickedRecently = lastClick && (Date.now() - lastClick) < 1000 * 86400 * 180;
            const lastVer = localStorage.stravaMapSwitcherLastDonationVersion;
            const thisVer = localStorage.stravaMapSwitcherVersion;
            const clickedThisVersion = !thisVer || (lastVer && thisVer === lastVer);

            const a = document.createElement('a');
            a.target = '_blank';
            a.style.cssText = 'font-size:10px;color:#aaa;text-decoration:none;display:block;margin-top:1px;';
            a.onmouseenter = () => a.style.color = '#fc4c02';
            a.onmouseleave = () => a.style.color = '#aaa';

            if (!clickedRecently || !clickedThisVersion) {
                a.href = 'https://www.paypal.me/lisknisi/10EUR';
                a.textContent = '♥ support this extension';
                a.onclick = () => {
                    localStorage.stravaMapSwitcherLastDonationClick = Date.now();
                    localStorage.stravaMapSwitcherLastDonationVersion = thisVer;
                };
            } else {
                a.href = 'https://github.com/liskin/strava-map-switcher#readme';
                a.textContent = 'strava-map-switcher';
            }
            return a;
        }

        // --- Header ---
        const header = document.createElement('div');
        header.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:space-between',
            'padding:5px 8px', 'cursor:pointer', 'user-select:none',
            'background:#f8f8f8', 'border-bottom:1px solid #ddd',
        ].join(';');

        const titleWrap = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = 'Strava Map Switcher';
        title.style.cssText = 'font-weight:bold;font-size:11px;color:#333;';
        titleWrap.appendChild(title);
        titleWrap.appendChild(makeDonationLink());

        const arrow = document.createElement('span');
        arrow.textContent = '▲';
        arrow.style.cssText = 'font-size:9px;margin-left:6px;transition:transform 0.2s;color:#999;align-self:flex-start;margin-top:2px;';

        header.appendChild(titleWrap);
        header.appendChild(arrow);

        // --- Body ---
        const body = document.createElement('div');
        body.style.cssText = 'padding:6px;overflow-y:auto;max-height:calc(80vh - 28px);';

        let collapsed = false;
        header.onclick = () => {
            collapsed = !collapsed;
            body.style.display = collapsed ? 'none' : 'block';
            arrow.style.transform = collapsed ? 'rotate(180deg)' : '';
        };

        container.appendChild(header);
        container.appendChild(body);

        // --- Buttons ---
        function addBtn(label, key) {
            const btn = document.createElement('div');
            btn.textContent = label;
            btn.style.cssText = 'cursor:pointer;padding:4px 8px;margin:1px 0;border-radius:3px;white-space:nowrap;';
            btn.onmouseenter = () => btn.style.background = '#f0f0f0';
            btn.onmouseleave = () => btn.style.background = '';
            btn.onclick = () => setLayer(key);
            body.appendChild(btn);
        }

        Object.entries(AdditionalMapLayers).forEach(([key, layer]) => addBtn(layer.name, key));

        const canvas = document.querySelector('canvas[data-testid="mre-canvas"]');
        const mapParent = canvas?.parentElement;
        if (mapParent) {
            mapParent.style.position = 'relative';
            mapParent.appendChild(container);
        }
    }

    async function init() {
        await MapSwitcher.wait(() => document.querySelector('canvas[data-testid="mre-canvas"]'));
        patchFatmap().catch(console.error);
    }
    init();
}