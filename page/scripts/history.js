class MangaHistory {
    constructor(DEBUG=false) {
        this.DEBUG = DEBUG;
        this.chapters = new Chapters(this.DEBUG);
        this.mangaInfo = new MangaInfo(this.DEBUG);
        this.target = document.getElementById("manga-list");
    }
    populate(mangaHistory) {
        // Clear
        clear(this.target);
    
        // If mangaHistory is empty, return
        if (!mangaHistory || mangaHistory.length === 0) {
            let emptyMessage = document.createElement("div");
            emptyMessage.textContent = "No manga in history.";
            this.target.appendChild(emptyMessage);
            return;
        }

        // Add manga to this.target
        this.sort(mangaHistory).forEach(
            (manga) => this.addManga(manga)
        );

        if (this.DEBUG) {
            console.log("DEBUG");
            // Click on first manga
            // this.target.children[0].click();
        }
    }
    addManga(manga) {
        let mangaFragment = document.createDocumentFragment();
        let mangaItem = document.createElement("div");
        mangaItem.classList.add("manga-item");
        mangaItem.setAttribute("data-manga", JSON.stringify(manga));

        // Event on click
        mangaItem.addEventListener("click", () => {
            let coverImg = mangaItem.getElementsByTagName("img")[0];
            let coverUrl = coverImg.getAttribute("data-src");
            this.mangaInfo.update(manga, coverUrl);
        });

        let mangaCover = document.createElement("img");
        mangaCover.classList.add("lazyload");
        mangaItem.appendChild(mangaCover);

        // Add title
        let mangaTitle = document.createElement("p");
        mangaTitle.textContent = manga.manga;
        mangaItem.appendChild(mangaTitle);

        // Add new chapters span
        let newChapters = document.createElement("span");
        newChapters.classList.add("invisible");
        newChapters.textContent = "0";
        mangaItem.appendChild(newChapters);

        // Append to fragment
        mangaFragment.appendChild(mangaItem);

        // Append to target
        this.target.appendChild(mangaFragment);
    }
    sort(mangaHistory) {
        let tmp = mangaHistory || [];
        // Sort by "date" property in each item
        tmp.sort((a, b) => {
            return b.date - a.date;
        });
        return tmp;
    }
    fillCovers(mangaCovers) {
        // For each manga in target
        let mangas = this.target.getElementsByClassName("manga-item");
        for (let manga of mangas) {
            // Get manga title
            let mangaTitle = JSON.parse(
                manga.getAttribute("data-manga")
            ).manga;
            // Get cover
            let cover = mangaCovers[mangaTitle] || "";
            // Set cover
            let coverImg = manga.getElementsByTagName("img")[0];
            coverImg.setAttribute("data-src", cover);
        }

        // Lazyload
        lazyload();

        // Fetch new chapters or covers
        for (let manga of mangas) {
            this.fetch(
                JSON.parse(manga.getAttribute("data-manga")),
                manga
            );
        }
    }
    async fetch(manga, target) {
        let newChaptersSpan = target.getElementsByTagName("span")[0];
        let coverImg = target.getElementsByTagName("img")[0];
        let coverUrl = coverImg.getAttribute("data-src");
        let isCoverMissing = (
            coverUrl.length === 0
            || coverUrl.endsWith(".html")
        );

        this.chapters.fetch(manga, isCoverMissing)
        .then(async (res) => {
            // New chapters
            // -- If no new chapters
            if (
                res.newChaptersNumber !== 0
                && res.newChaptersNumber !== undefined
            ) {
                // -- Add new chapters to span
                newChaptersSpan.textContent = "+" + res.newChaptersNumber;
                // -- Show new chapters
                newChaptersSpan.classList.remove("invisible");
            }

            // Cover
            // -- If cover is already set, don't update it.
            let cover = res.cover;
            if (cover !== "" && cover !== undefined) {
                // -- Update cover
                coverImg.src = cover;
                // -- Save cover
                let mangaCovers = await browser.storage.local.get("mangaCovers")
                .then((res) => res.mangaCovers)
                .catch(() => {}) || {};
                mangaCovers[manga.manga] = cover;
                browser.storage.local.set({mangaCovers: mangaCovers});
            }
        });
    }
}
