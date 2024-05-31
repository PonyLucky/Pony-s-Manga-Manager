// -----------------------------
// Manga History
// -----------------------------

try {
    browser.storage.local.get("mangaHistory", async (data) => {
        // Init settings
        await initSettings();

        // Create mangaHistory
        let mangaHistory = new MangaHistory();
        // Populate mangaHistory
        mangaHistory.populate(data.mangaHistory || []);

        // Get mangaCovers asynchronously
        mangaHistory.fillCovers().then();
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
    // Get synced history
    let sync = new Sync();
    let syncedHistory = await sync.getMangaHistory();
    // Merge synced history with local history
    if (syncedHistory.length > 0) {
        // Get local history
        let localHistory = await browser.storage.local.get("mangaHistory")
        .then((res) => res.mangaHistory)
        .catch(() => []) || [];
        // Merge synced history with local history
        let mergedHistory = [...syncedHistory, ...localHistory];
        // Remove duplicates
        mergedHistory = mergedHistory.filter((manga, index, self) =>
            index === self.findIndex((t) => (
                t.manga === manga.manga
            ))
        );
        // Save merged history
        browser.storage.local.set({mangaHistory: mergedHistory});
        // Save merged history to synced history
        sync.saveMangaHistory().then();
    }

    // Get mangaSettings from storage.
    let mangaSettings = await browser.storage.local.get("mangaSettings")
    .then((res) => res.mangaSettings || {})
    .catch(() => {});

    // Initialize auto-add-checkbox
    let autoAddCheckbox = document.getElementById("auto-add-checkbox");
    autoAddCheckbox.checked = !('autoAdd' in mangaSettings && mangaSettings.autoAdd === false);

    // Init sync url
    let syncUrl = document.getElementById("sync-input");
    syncUrl.value = 'sync' in mangaSettings ? mangaSettings.sync : 'http://localhost:7777';

    // Initialize themes
    let themes = Themes.list();
    const currentTheme = mangaSettings.theme || "default";
    let themeForm = document.getElementById("theme-form");
    for (let i = 0; i < themes.length; i++) {
        let theme = themes[i];
        let themeRadio = document.createElement("input");
        themeRadio.type = "radio";
        themeRadio.id = theme;
        themeRadio.name = "theme";
        themeRadio.value = theme;
        if (theme === currentTheme) {
            themeRadio.checked = true;
        }
        themeForm.appendChild(themeRadio);
        let themeLabel = document.createElement("label");
        themeLabel.htmlFor = theme;
        themeLabel.innerText = theme;
        themeForm.appendChild(themeLabel);
    }
    // Apply theme
    Themes.apply(currentTheme);
}
