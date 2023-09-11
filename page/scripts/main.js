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
        mangaHistory.fillCovers();
    });
}
catch (e) {
    console.log("NOT AS EXTENSION!!!");
    console.log(e);
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
