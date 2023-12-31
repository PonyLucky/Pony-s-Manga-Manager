const DEBUG = false;

// ---------------------------- OPEN ON CLICK ----------------------------

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({
        url: browser.runtime.getURL("page/index.html")
    });
});

// ---------------------------- MANGA WEBSITES ----------------------------

browser.webRequest.onCompleted.addListener(async (details) => {
    const url = details.url;
    let mangaChapterInfo = {};
    let tmp = [];

    // Check Websites.
    tmp.push(await Mangaread.check(url).then(res => res));
    tmp.push(await Mangakik.check(url).then(res => res));
    tmp.push(await NeatManga.check(url).then(res => res));
    tmp.push(await Manhwatop.check(url).then(res => res));
    
    // Get first non-empty result.
    mangaChapterInfo = tmp.find((manga) => {
        return manga !== undefined;
    });
    
    // Check if mangaChapterInfo is not empty.
    if (mangaChapterInfo !== undefined) {
        // Update mangaHistory.
        await updateMangaHistory(mangaChapterInfo);
    }
},
{urls: ["<all_urls>"]});

// ---------------------------- FUNCTIONS ----------------------------

async function updateMangaHistory(mangaChapterInfo) {
    let mangaHistory = await browser.storage.local.get("mangaHistory")
    .then((res) => res.mangaHistory)
    .catch(() => []) || [];

    // Check if manga is already in mangaHistory.
    let mangaIndex = mangaHistory.findIndex((manga) => {
        return manga.manga === mangaChapterInfo.manga;
    });
    
    // If manga is in mangaHistory.
    if (mangaIndex !== -1) {
        // DEBUG
        if (DEBUG) console.log("Manga is in mangaHistory.");

        // Check if chapter is already in mangaHistory.
        let chapterIndex = mangaHistory[mangaIndex].chapters.findIndex((chapters) => {
            return chapters === mangaChapterInfo.chapters[0];
        });
        // If chapter is in mangaHistory.
        if (chapterIndex !== -1) {
            // DEBUG
            if (DEBUG) console.log("Moving chapter to front.");
            // Remove chapter from mangaHistory.
            mangaHistory[mangaIndex].chapters.splice(chapterIndex, 1);
        }
        else if (DEBUG) console.log("Chapter is not in mangaHistory."); 
        // Update date.
        mangaHistory[mangaIndex].date = mangaChapterInfo.date;
        // Update cover.
        updateMangaCovers(mangaChapterInfo);
        // Add chapter to mangaHistory.
        mangaHistory[mangaIndex].chapters.unshift(mangaChapterInfo.chapters[0]);
    }
    // If manga is not in mangaHistory.
    else {
        // DEBUG
        if (DEBUG) console.log("Manga is not in mangaHistory.");

        // Check if mangaSettings exists and has true at 'autoAdd'.
        let mangaSettings = await browser.storage.local.get("mangaSettings")
        .then((res) => res.mangaSettings)
        .catch(() => {}) || {};

        let autoAdd = false;
        if ('autoAdd' in mangaSettings) {
            if (mangaSettings.autoAdd === true) autoAdd = true;
        }
        else autoAdd = true;

        // If autoAdd is true.
        if (autoAdd) {
            // Update cover.
            updateMangaCovers(mangaChapterInfo);
            // Add manga to mangaHistory.
            mangaHistory.unshift(mangaChapterInfo);
        }
        else {
            // DEBUG
            if (DEBUG) console.log("Auto add is false.");
            return;
        }
    }

    // DEBUG
    if (DEBUG) console.log(
        "MangaHistory: "
        + JSON.stringify(mangaHistory, null, 2)
    );

    // Save mangaHistory to localStorage.
    browser.storage.local.set({mangaHistory: mangaHistory});
}

async function updateMangaCovers(mangaChapterInfo) {
    // Get data
    let manga = mangaChapterInfo.manga;
    let cover = mangaChapterInfo.cover;
    
    // Remove 'cover' from mangaChapterInfo.
    delete mangaChapterInfo.cover;

    // DEBUG
    if (DEBUG) console.log("Updating cover.");

    // Update cover
    await browser.storage.local.set({[manga]: cover});
}
