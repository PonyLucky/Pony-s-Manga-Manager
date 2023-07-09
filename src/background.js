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

    // Get first non-empty result.
    mangaChapterInfo = tmp.find((manga) => {
        return manga !== undefined;
    });

    // Check if mangaChapterInfo is not empty.
    if (mangaChapterInfo !== undefined && mangaChapterInfo !== {}) {
        // Update mangaHistory.
        updateMangaHistory(mangaChapterInfo);
    }
},
{urls: ["<all_urls>"]});

// ---------------------------- FUNCTIONS ----------------------------

function updateMangaHistory(mangaChapterInfo) {
    browser.storage.local.get("mangaHistory").then((res) => {
        let mangaHistory = res.mangaHistory || [];

        // DEBUG
        if (DEBUG) console.log(
            "MangaHistory before update: "
            + JSON.stringify(mangaHistory, null, 2)
        );

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
            // Add chapter to mangaHistory.
            mangaHistory[mangaIndex].chapters.unshift(mangaChapterInfo.chapters[0]);
        }
        // If manga is not in mangaHistory.
        else {
            // DEBUG
            if (DEBUG) console.log("Manga is not in mangaHistory.");

            // Add manga to mangaHistory.
            mangaHistory.unshift(mangaChapterInfo);
        }

        // DEBUG
        if (DEBUG) console.log(
            "MangaHistory after update: "
            + JSON.stringify(mangaHistory, null, 2)
        );

        // Save mangaHistory to localStorage.
        browser.storage.local.set({mangaHistory: mangaHistory});
    });
}
