document.getElementById("save-button").addEventListener("click", saveHistory);
document.getElementById("upload-button").addEventListener("click", uploadHistory);
document.getElementById("clear-button").addEventListener("dblclick", clearHistory);

browser.storage.local.get("mangaHistory", (data) => {
    populateHistory(data.mangaHistory);
});

function populateHistory(mangaHistory) {
    let mangaList = document.getElementById("manga-list");

    // Clear mangaList
    while (mangaList.firstChild) {
        mangaList.removeChild(mangaList.firstChild);
    }

    // If mangaHistory is empty
    if (!mangaHistory || mangaHistory.length === 0) {
        let emptyMessage = document.createElement("div");
        emptyMessage.textContent = "No manga in history.";
        mangaList.appendChild(emptyMessage);
        return;
    }

    // Populate sorted mangaHistory
    sortHistory(mangaHistory).forEach((manga) => {
        let mangaItem = document.createElement("div");

        // Add span for manga title
        let mangaTitle = document.createElement("span");
        mangaTitle.textContent = manga.manga;
        mangaItem.appendChild(mangaTitle);

        // Add span for chapter number
        let chapterNumber = document.createElement("span");
        chapterNumber.classList.add("chapter-number");
        chapterNumber.textContent = manga.chapters[0];
        chapterNumber.onclick = (event) => {
            // Prevent default
            event.preventDefault();
            // Pass to chapters history
            chaptersHistory(manga);
        }
        chapterNumber.title = "Click to see chapters history";
        mangaItem.appendChild(chapterNumber);

        // Add title to specify date from last chapter (in timestamp)
        mangaItem.title = "Last read since " + new Date(manga.date).toLocaleString();

        // Close popup on link click
        mangaItem.addEventListener("click", (e) => {
            if (!e.target.classList.contains("chapter-number")) {
                // Go to manga URL
                browser.tabs.create({
                    url: manga.url + "chapter-" + manga.chapters[0]
                });
                window.close();
            }
        });

        // Add more details and event listeners for interaction
        mangaList.appendChild(mangaItem);
    });
}

function sortHistory(mangaHistory) {
    let mangaHistoryTmp = mangaHistory || [];
    // Sort by "date" property in each item
    mangaHistoryTmp.sort((a, b) => {
        return b.date - a.date;
    });
    return mangaHistoryTmp;
}

function saveHistory() {
    console.log("Saving history...");

    // Save mangaHistory to json file
    browser.storage.local.get("mangaHistory", (data) => {
        let mangaHistory = data.mangaHistory || [];

        // Get current tab
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then((tabs) => {
            // Create dl link
            let dlLink = document.createElement("a");
            dlLink.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mangaHistory));
            dlLink.download = "manga-history.json";
            dlLink.style.display = "none";
            // Add to body
            document.body.appendChild(dlLink);
            // Click link
            dlLink.click();
            // Remove link
            document.body.removeChild(dlLink);
        });
    });
}

function uploadHistory() {
    console.log("Uploading history...");
}

function clearHistory() {
    console.log("Clearing history...");

    // Clear mangaHistory
    browser.storage.local.set({mangaHistory: []});
    // Clear mangaList
    populateHistory([]);
}

function toggle(elmt, val) {
    if (val === undefined) {
        elmt.classList.toggle("hide");
    }
    else if (val === true) {
        elmt.classList.add("hide");
    }
    else if (val === false) {
        elmt.classList.remove("hide");
    }
}

function chaptersHistory(history) {
    let chapters = document.getElementById("manga-chapters");

    // Hide mangaList
    toggle(document.getElementById("manga-list"), true);
    // Hide buttons
    toggle(document.getElementsByClassName("buttons")[0], true);
    // Display manga-chapters
    toggle(chapters, false);

    // Clear chapters
    while (chapters.firstChild) {
        chapters.removeChild(chapters.firstChild);
    }

    // Populate chapters
    // -- Add title
    let title = document.createElement("h2");
    title.textContent = history.manga;
    chapters.appendChild(title);
    // -- Add chapters
    let list = document.createElement("ul");
    history.chapters.forEach((chapter) => {
        let item = document.createElement("li");
        item.textContent = "Chapter " + chapter;
        item.title = "Click to open chapter";
        item.onclick = (event) => {
            let url = history.url + "chapter-" + chapter;
            // Open new tab
            browser.tabs.create({url: url});
            // Close popup
            window.close();
        };
        list.appendChild(item);
    });
    chapters.appendChild(list);
    // -- Add button to go back to mangaList
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("flex");
    let backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.addEventListener("click", () => {
        toggle(chapters, true);
        toggle(document.getElementById("manga-list"), false);
        toggle(document.getElementsByClassName("buttons")[0], false);
    });
    buttonContainer.appendChild(backButton);
    chapters.appendChild(buttonContainer);
}
