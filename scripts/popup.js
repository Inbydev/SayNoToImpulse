document.addEventListener("DOMContentLoaded", () => {
    const domainsList = document.getElementById("domainsList");
    const domainInput = document.getElementById("domainInput");
    const addBtn = document.getElementById("addBtn");

    function normalise(domain) {
        return domain
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/.*$/, "")
            .toLowerCase()
            .trim();
    }

    function aviso(msg) {
        alert(msg);
        domainInput.focus();
    }

    async function load() {
        domainsList.textContent = "Loading...";
        domainsList.className = "domains-list empty-state";

        const { blockedDomains = [] } = await browser.storage.sync
            .get("blockedDomains")
            .catch(() => browser.storage.local.get("blockedDomains"));

        render(blockedDomains);
    }

    function render(domains) {
        domainsList.className = "domains-list";

        if (!domains.length) {
            domainsList.textContent = "No hay sitios bloqueados";
            domainsList.className = "domains-list empty-state";
            return;
        }

        domainsList.innerHTML = "";

        domains.forEach((domain) => {
            const item = document.createElement("div");
            item.className = "domain-item";

            const name = document.createElement("span");
            name.className = "domain-name";
            name.textContent = domain;

            const btn = document.createElement("button");
            btn.className = "remove-btn";
            btn.textContent = "✕";
            btn.addEventListener("click", () => deleteDomain(domain));

            item.appendChild(name);
            item.appendChild(btn);
            domainsList.appendChild(item);
        });
    }

    async function addDomain() {
        const raw = domainInput.value.trim();
        const dom = normalise(raw);

        if (!dom) return aviso("Escribe un dominio");
        if (dom.length < 3 || !/^[a-z0-9][a-z0-9\-._]*[a-z0-9]$/.test(dom))
            return aviso("Formato inválido. Ej: youtube.com");

        const { blockedDomains = [] } = await browser.storage.sync
            .get("blockedDomains")
            .catch(() => browser.storage.local.get("blockedDomains"));

        if (blockedDomains.includes(dom)) return aviso("Ya está bloqueado");

        blockedDomains.push(dom);
        await browser.storage.sync.set({ blockedDomains });
        domainInput.value = "";
        load();
    }

    async function deleteDomain(domain) {
        const { blockedDomains = [] } = await browser.storage.sync
            .get("blockedDomains")
            .catch(() => browser.storage.local.get("blockedDomains"));

        const filtrado = blockedDomains.filter((d) => d !== domain);
        await browser.storage.sync.set({ blockedDomains: filtrado });
        load();
    }

    addBtn.addEventListener("click", addDomain);
    domainInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") addDomain();
    });

    load();
    domainInput.focus();
});
