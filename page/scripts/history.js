class MangaHistory {
    constructor(DEBUG=false) {
        this.DEBUG = DEBUG;
        this.chapters = new Chapters(this.DEBUG);
        this.mangaInfo = new MangaInfo(this.DEBUG);
        this.target = document.getElementById("manga-list");
    }
    populate(mangaHistory, mangaCovers) {
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
            (manga) => {
                let cover = mangaCovers[manga.manga] || "";
                this.addManga(manga, cover);
            }
        );

        if (this.DEBUG) {
            console.log("DEBUG");
            // Click on first manga
            // this.target.children[0].click();
        }
    }
    addManga(manga, cover) {
        let mangaItem = document.createElement("div");
        mangaItem.classList.add("manga-item");
        // Click
        mangaItem.addEventListener("click", () => {
            let coverImg = mangaItem.getElementsByTagName("img")[0];
            this.mangaInfo.update(manga, coverImg.src);
        });

        let mangaCover = document.createElement("img");
        mangaCover.src = cover;
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

        // Fetch new data asynchronously
        this.fetch(manga, mangaItem);

        // Append to target
        this.target.appendChild(mangaItem);
    }
    sort(mangaHistory) {
        let tmp = mangaHistory || [];
        // Sort by "date" property in each item
        tmp.sort((a, b) => {
            return b.date - a.date;
        });
        return tmp;
    }
    fetch(manga, target) {
        let newChaptersSpan = target.getElementsByTagName("span")[0];
        let coverImg = target.getElementsByTagName("img")[0];
        let isCoverMissing = (
            coverImg.src.length === 0
            || coverImg.src.endsWith(".html")
        );

        this.chapters.fetch(manga, isCoverMissing)
        .then(async (res) => {
            // New chapters
            // -- If no new chapters
            if (res.newChaptersNumber === 0) return;
            // -- Add new chapters to span
            newChaptersSpan.textContent = "+" + res.newChaptersNumber;
            // -- Show new chapters
            newChaptersSpan.classList.remove("invisible");

            // Cover
            // -- If cover is already set, don't update it.
            let cover = res.cover;
            if (cover === "") return;
            // -- Update cover
            coverImg.src = cover;
            // -- Save cover
            let mangaCovers = await browser.storage.local.get("mangaCovers")
            .then((res) => res.mangaCovers)
            .catch(() => {}) || {};
            mangaCovers[manga.manga] = cover;
            browser.storage.local.set({mangaCovers: mangaCovers});
        });
    }
}
