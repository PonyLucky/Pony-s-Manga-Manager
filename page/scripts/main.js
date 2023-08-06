// -----------------------------
// Manga History
// -----------------------------

try {
    browser.storage.local.get("mangaHistory", async (data) => {
        let start1 = new Date();
        // Init settings
        await initSettings();
        console.log("initSettings: " + (new Date() - start1) + "ms");

        let start2 = new Date();
        // Get data
        let mangaHistory = data.mangaHistory || [];
        let mangaCovers = await browser.storage.local.get("mangaCovers")
        .then((res) => res.mangaCovers)
        .catch(() => {}) || {};
        console.log("get data: " + (new Date() - start2) + "ms");

        let start3 = new Date();
        // Populate mangaHistory
        (new MangaHistory()).populate(mangaHistory, mangaCovers);
        console.log("populate: " + (new Date() - start3) + "ms");
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
