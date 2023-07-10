class MangaHistory {
    constructor(DEBUG=false) {
        this.DEBUG = DEBUG;
        this.chapters = new Chapters(this.DEBUG);
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
    }
    addManga(manga) {
        let mangaItem = document.createElement("div");
        mangaItem.classList.add("manga-item");

        let mangaCover = document.createElement("img");
        mangaCover.src = manga.cover;
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
    // addManga(manga) {
    //     // Create div for manga
    //     let mangaItem = document.createElement("div");

    //     // Add span for manga title
    //     let mangaTitle = document.createElement("span");
    //     mangaTitle.textContent = manga.manga;
    //     mangaItem.appendChild(mangaTitle);

    //     // Add span for chapter number
    //     let chapterNumber = document.createElement("span");
    //     chapterNumber.classList.add("chapter-number");
    //     chapterNumber.textContent = manga.chapters[0];
    //     chapterNumber.onclick = (event) => {
    //         // Prevent default
    //         event.preventDefault();
    //         // Pass to chapter's history
    //         this.chapters.list(manga);
    //     }
    //     chapterNumber.title = "Click to see chapters history";
    //     mangaItem.appendChild(chapterNumber);

    //     // Add span for new chapters
    //     let newChapters = document.createElement("span");
    //     newChapters.classList.add("new-chapters");
    //     newChapters.classList.add("hide");
    //     newChapters.textContent = "+0";
    //     mangaItem.appendChild(newChapters);

    //     // Fetch new chapters asynchronously
    //     this.fetchNewChapters(manga, newChapters);

    //     // Add title to specify date from last chapter (in timestamp)
    //     mangaItem.title = "Last read since "
    //         + new Date(manga.date).toLocaleString();

    //     // Close popup on link click
    //     mangaItem.addEventListener("click", (e) => {
    //         if (!e.target.classList.contains("chapter-number")) {
    //             // Go to manga URL
    //             browser.tabs.create({
    //                 url: manga.url + "chapter-" + manga.chapters[0]
    //             });
    //             window.close();
    //         }
    //     });

    //     // Add more details and event listeners for interaction
    //     this.target.appendChild(mangaItem);
    // }
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
