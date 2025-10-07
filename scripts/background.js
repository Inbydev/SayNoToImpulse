const browser = globalThis.browser;

let blocked = new Set();

function loadBlocked() {
    browser.storage.sync
        .get("blockedDomains")
        .then((d) => (blocked = new Set(d.blockedDomains || [])))
        .catch(() =>
            browser.storage.local
                .get("blockedDomains")
                .then((d) => (blocked = new Set(d.blockedDomains || []))),
        );
}
loadBlocked();
browser.storage.onChanged.addListener(loadBlocked);

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        const host = new URL(details.url).hostname
            .replace(/^www\./i, "")
            .toLowerCase();
        if (!blocked.has(host)) return;
        return { redirectUrl: browser.runtime.getURL("/static/no.html") };
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"],
);
