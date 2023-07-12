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

        // If DEBUG, click on first manga
        if (this.DEBUG) {
            this.target.children[0].click();
        }
    }
    addManga(manga, cover) {
        let mangaItem = document.createElement("div");
        mangaItem.classList.add("manga-item");
        // Click
        mangaItem.addEventListener("click", () => {
            this.mangaInfo.update(manga);
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
        newChapters.classList.add("hide");
        newChapters.textContent = "0";
        mangaItem.appendChild(newChapters);
        // Fetch new chapters asynchronously
        this.fetchNewChapters(manga, newChapters);

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
    fetchNewChapters(manga, target) {
        this.chapters.fetch(manga.url, manga.chapters[0])
        .then((newChaptersNumber) => {
            // If no new chapters
            if (newChaptersNumber === 0) return;
            // Add new chapters to span
            target.textContent = "+" + newChaptersNumber;
            // Show new chapters
            toggle(target, false);
        });
    }
}
