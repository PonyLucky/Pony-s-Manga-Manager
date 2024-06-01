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
    let tmp = [];

    // Check Websites.
    tmp.push(await Mangaread.check(url).then(res => res));
    tmp.push(await Mangakik.check(url).then(res => res));
    tmp.push(await NeatManga.check(url).then(res => res));
    tmp.push(await Manhwatop.check(url).then(res => res));
    
    // Get first non-empty result.
    let mangaChapterInfo = tmp.find((manga) => {
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
    let mangaSettings = await browser.storage.local.get("mangaSettings")
        .then((res) => res.mangaSettings)
        .catch(() => {}) || {};

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
        let autoAdd = false;
        if ('autoAdd' in mangaSettings) {
            if (mangaSettings.autoAdd === true) autoAdd = true;
        }
        else autoAdd = true;

        // If autoAdd is true.
        if (autoAdd) {
            // Update cover.
            updateMangaCovers(mangaChapterInfo).then();
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
    await browser.storage.local.set({mangaHistory: mangaHistory});

    // Merge synced history with local history
    let sync = new Sync(mangaSettings.sync);
    let syncedHistory = await sync.getMangaHistory();
    if (syncedHistory.length > 0) {
        // Get local history
        let localHistory = mangaHistory;
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
        sync.saveMangaHistory().then();
    }
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

class Sync {
    constructor(url='') {
        // Port is '7777' because '77' is the decimal ASCII code for 'M'
        // So '7777' is 'MM' -> MangaManager
        this.url = url;
    }

    async fetch(path, params = {}) {
        let error = {
            status: 'error',
            message: 'Failed to fetch data from server.',
            data: []
        }
        return await fetch(this.url + path, params)
            .then(res => res.json())
            .then(data => data)
            .catch(() => error)
    }

    async test() {
        if (this.url.length === 0) return false;
        let response = await this.fetch('/test');
        let syncResult = document.getElementById('sync-result');
        syncResult.textContent = response.message;
        return response.status === 'success';
    }

    async getMangaHistory() {
        if (this.url.length === 0) return [];
        let response = await this.fetch('/manga');
        return response.data || [];
    }

    async saveMangaHistory() {
        if (this.url.length === 0) return false;
        let mangaHistory = await browser.storage.local.get("mangaHistory")
            .then((res) => res.mangaHistory)
            .catch(() => []) || [];
        let response = await this.fetch('/manga', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mangaHistory)
        });
        return response.status === 'success';
    }
}
