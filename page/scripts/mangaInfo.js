class MangaInfo {
    constructor(DEBUG=false) {
        this.DEBUG = DEBUG;
        this.info = document.getElementById("manga-info");
        this.cover = document.getElementById("manga-info-image");
        this.title = document.getElementById("manga-info-title");
        this.author = document.getElementById("manga-info-author");
        this.status = document.getElementById("manga-info-status");
        this.read = document.getElementById("manga-info-read");
        this.current = document.getElementById("manga-info-current");
        this.genres = document.getElementById("manga-info-details-genres");
        this.chapters = document.getElementById("manga-info-details-chapters");
        this.lastUpdate = document.getElementById("manga-info-details-last-update");
        this.description = document.getElementById("manga-info-description");
    }
    update(manga) {
        // DEBUG
        if (this.DEBUG) console.log(
            "MangaInfo.update: "
            + JSON.stringify(manga, null, 2)
        );

        // Update manga info
        this.cover.src = manga.cover;
        this.title.innerText = manga.manga;
        this.author.innerText = manga.author;
        this.status.innerText = manga.status;
        // Up to 10 characters
        if (manga.chapters[0].length > 20) {
            this.current.innerText = manga.chapters[0].slice(0, 17)
                + "...";
            this.current.title = manga.chapters[0];
        }
        else this.current.innerText = manga.chapters[0];
        this.genres.innerText = manga.genres.join(", ");
        this.chapters.innerText = manga.chapters.length;
        this.lastUpdate.innerText = manga.lastDate;
        if (manga.description.trim().length === 0) {
            this.description.innerText = "No description available.";
        }
        else this.description.innerText = manga.description;

        // Update read button
        this.read.url = manga.url + "chapter-" + manga.chapters[0] + "/";

        // Update info
        this.info.dataset.manga = JSON.stringify(manga);

        // Hide mangaList
        toggle(document.getElementById("manga-list"), true);
        // Hide buttons
        toggle(document.getElementsByClassName("buttons")[0], true);
        // Display manga info
        toggle(this.info, false);
    }
}
