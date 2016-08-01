var s = document.createElement("script");
s.src = chrome.extension.getURL('fix.js');
s.type = 'text/javascript';
document.body.appendChild(s);
