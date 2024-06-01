// -----------------------------
// Manga History
// -----------------------------

try {
    init().then();
}
catch (e) {
    console.log("NOT AS EXTENSION!!!");
    console.log(e);
}

async function init() {
    // Get mangaSettings from storage.
    let mangaSettings = await browser.storage.local.get("mangaSettings")
        .then((res) => res.mangaSettings || {})
        .catch(() => {});
    // Get synced history
    let sync = new Sync(mangaSettings.sync);
    let syncedHistory = await sync.getMangaHistory();
    let syncInput = document.getElementById("sync-input");
    // Merge synced history with local history
    if (syncedHistory.length > 0) {
        // Say that the sync is working
        syncInput.textContent = "Connected to sync server.";
        // Get local history
        let localHistory = await browser.storage.local.get("mangaHistory")
            .then((res) => res.mangaHistory)
            .catch(() => []) || [];
        // If not equal, merge
        if (JSON.stringify(syncedHistory) !== JSON.stringify(localHistory)) {
            // Merge synced history with local history
            let mergedHistory = [];
            for (let i = 0; i < syncedHistory.length; i++) {
                let manga = syncedHistory[i];
                let index = localHistory.findIndex((m) => m.manga === manga.manga);
                if (index !== -1) {
                    // Which is the most recent 'date'?
                    if (manga.date > localHistory[index].date) {
                        mergedHistory.push(manga);
                    }
                    else {
                        mergedHistory.push(localHistory[index]);
                    }
                }
                else {
                    mergedHistory.push(manga);
                }
            }
            // Add local history that is not in synced history
            for (let i = 0; i < localHistory.length; i++) {
                let manga = localHistory[i];
                let index = mergedHistory.findIndex((m) => m.manga === manga.manga);
                if (index === -1) {
                    mergedHistory.push(manga);
                }
            }
            // Save merged history
            await browser.storage.local.set({mangaHistory: mergedHistory});
            // Save merged history to synced history
            sync.saveMangaHistory().then();
        }
    } else {
        // Save local history to synced history
        sync.saveMangaHistory().then(res => {
            if (res) syncInput.textContent = "Connected to sync server.";
            else syncInput.textContent = "Failed to connect to sync server.";
        });
    }
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
