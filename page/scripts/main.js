// -----------------------------
// Manga History
// -----------------------------

try {
    browser.storage.local.get("mangaHistory", async (data) => {
        // Init settings
        await initSettings();

        // Get data
        let mangaHistory = data.mangaHistory || [];
        let mangaCovers = await browser.storage.local.get("mangaCovers")
        .then((res) => res.mangaCovers)
        .catch(() => {}) || {};

        // Populate mangaHistory
        (new MangaHistory()).populate(mangaHistory, mangaCovers);
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
