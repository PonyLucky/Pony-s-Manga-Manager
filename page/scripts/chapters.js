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
        // -- Add buttons to go back to mangaList
        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add("buttons");
        buttonContainer.classList.add("flex");
        let backButton = document.createElement("button");
        backButton.textContent = "Back";
        backButton.addEventListener("click", () => {
            toggle(chapters, true);
            toggle(document.getElementById("manga-info"), false);
        });
        buttonContainer.appendChild(backButton);
        chapters.appendChild(buttonContainer);
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
    async fetch(url, number) {
        // DEBUG
        if (this.DEBUG) {
            console.log("URL: " + url);
            console.log("Number: " + number);
        }

        // Strategy pattern to select website to use.
        let website = selectWebsites(url);

        // Get chapters.
        let mangaChapters = await website.getChapters(url)
            .then(chapters => chapters)
            .catch(() => []);

        // DEBUG
        if (this.DEBUG) console.log(mangaChapters);

        // Return null if no chapters.
        if (mangaChapters.length == 0) return 0;
        // Get index of chapter.
        let index = mangaChapters.indexOf(number);

        // DEBUG
        if (this.DEBUG) console.log(index);

        // Return null if chapter not found.
        if (index == -1) return 0;
        // Return number of new chapters.
        return index;
    }
}
