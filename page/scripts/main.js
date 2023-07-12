// -----------------------------
// Manga History
// -----------------------------

try {
    browser.storage.local.get("mangaHistory", async (data) => {
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
