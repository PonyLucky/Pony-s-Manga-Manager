class Chapters {
    constructor(DEBUG=false) {
        this.DEBUG = DEBUG;
    }
    list(history) {
        let chapters = document.getElementById("manga-chapters");

        // Hide mangaList
        toggle(document.getElementById("manga-info"), true);
        // Display manga-chapters
        toggle(chapters, false);

        // Clear chapters list
        clear(chapters);

        // Populate chapters list
        // -- Add title
        let title = document.createElement("h2");
        title.textContent = history.manga;
        chapters.appendChild(title);
        // -- Add each chapter to list
        let chapterList = document.createElement("ul");
        history.chapters.forEach((chapter) => {
            chapterList.appendChild(
                this.addChapter(history.url, chapter)
            );
        });
        chapters.appendChild(chapterList);
    }
    addChapter(baseUrl, chapter) {
        let item = document.createElement("li");
        item.textContent = "Chapter " + chapter;
        item.title = "Click to open chapter";
        item.onclick = () => {
            let url = baseUrl + "chapter-" + chapter;
            // Open new tab
            browser.tabs.create({url: url});
            // Close popup
            window.close();
        };
        return item;
    }
    async fetch(manga, isCoverMissing, isOnMobile) {
        let url = manga.url;
        let number = manga.chapters[0];

        // Strategy pattern to select website to use.
        let website = selectWebsites(url);

        // Get chapters.
        let mangaChapters = await website.getChapters(url)
        .then(chapters => chapters)
        .catch(() => []);

        // Return null if no chapters.
        if (mangaChapters.length === 0) return 0;
        // Get index of chapter.
        let index = mangaChapters.indexOf(number);

        // Return null if chapter not found.
        if (index === -1) return 0;

        let mangaCover = "";
        let mangaCoverUrl = "";
        if (isCoverMissing === true) {
            // Get manga cover.
            let coverTmp = await getContentPage(url)
            .then(async (doc) => {
                return await website.getCover(doc)
                .then(cover => cover)
                .catch(() => ['', '']);
            })
            .catch(() => ['', '']);
            // Set cover
            mangaCover = coverTmp[0];
            mangaCoverUrl = coverTmp[1];
        }
        if (isOnMobile) {
            // Get manga cover.
            let coverTmp = await getContentPage(url)
                .then(async (doc) => {
                    return await website.getCover(doc)
                        .then(cover => cover)
                        .catch(() => ['', '']);
                })
                .catch(() => ['', '']);
            mangaCoverUrl = coverTmp[1];
        }

        // DEBUG
        if (this.DEBUG) {
            console.group(manga.manga);
            console.log("URL: " + url);
            console.log("Current chapter: " + number + " (" + index + ")");
            console.log("Chapters: ");
            console.log(mangaChapters);
            console.log("Cover: " + mangaCover);
            console.log("Cover URL: " + mangaCoverUrl);
            console.groupEnd();
        }

        // Return data
        return {
            newChaptersNumber: index,
            cover: mangaCover,
            coverUrl: mangaCoverUrl
        }
    }
}
