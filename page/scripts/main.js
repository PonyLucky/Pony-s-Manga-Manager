// -----------------------------
// Manga History
// -----------------------------

try {
    browser.storage.local.get("mangaHistory", async (data) => {
        let start1 = new Date();
        // Init settings
        await initSettings();

        // Create mangaHistory
        let mangaHistory = new MangaHistory();
        // Populate mangaHistory
        mangaHistory.populate(data.mangaHistory || []);

        // Get mangaCovers asynchonously
        browser.storage.local.get("mangaCovers")
        .then(async (res) => mangaHistory.fillCovers(res.mangaCovers || {}))
        .catch(() => {});
    });
}
catch (e) {
    console.log(e);
    // DEBUG
    const data = mangaHistoryData || [];
    const covers = mangaCoversData || {};
    (new MangaHistory(true)).populate(data, covers);
}

// -----------------------------
// Events
// -----------------------------

// Initialize events
Events.init();

// -----------------------------
// Manga Settings
// -----------------------------

async function initSettings() {
    // Get mangaSettings from storage.
    let mangaSettings = await browser.storage.local.get("mangaSettings")
    .then((res) => res.mangaSettings || {})
    .catch(() => {});

    // Initialize auto-add-checkbox
    let autoAddCheckbox = document.getElementById("auto-add-checkbox");
    autoAddCheckbox.checked = true;
    if ('autoAdd' in mangaSettings && mangaSettings.autoAdd === false) {
        autoAddCheckbox.checked = false;
    }
}
