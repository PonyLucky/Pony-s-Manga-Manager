// -----------------------------
// Manga History
// -----------------------------

try {
    // Populate
    browser.storage.local.get("mangaHistory", (data) => {
        (new MangaHistory()).populate(data.mangaHistory);
    });
}
catch (e) {
    console.log(e);
    // DEBUG
    const data = mangaHistoryData || [];
    (new MangaHistory(true)).populate(data);
}

// -----------------------------
// Events
// -----------------------------

// Initialize events for buttons
Events.init();
