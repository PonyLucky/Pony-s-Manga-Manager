// Handle save/upload/clear buttons
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
            chaptersList(manga);
        }
        chapterNumber.title = "Click to see chapters history";
        mangaItem.appendChild(chapterNumber);

        // Add span for new chapters
        let newChapters = document.createElement("span");
        newChapters.classList.add("new-chapters");
        newChapters.classList.add("hide");
        newChapters.textContent = "+0";
        mangaItem.appendChild(newChapters);

        // Fetch new chapters asynchronously
        fetchNewChapters(manga.url, manga.chapters[0])
        .then((newChaptersNumber) => {
            // If no new chapters
            if (newChaptersNumber === 0) return;
            // Add new chapters to span
            newChapters.textContent = "+" + newChaptersNumber;
            // Show new chapters
            toggle(newChapters, false);
        });

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

        // Save only the last chapter read for each manga
        let mangaHistoryTmp = [];
        mangaHistory.forEach((manga) => {
            let mangaTmp = manga;
            mangaTmp.chapters = [manga.chapters[0]];
            mangaHistoryTmp.push(mangaTmp);
        });

        // Get current tab
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then((tabs) => {
            // Create dl link
            let dlLink = document.createElement("a");
            dlLink.href = "data:text/json;charset=utf-8," + encodeURIComponent(
                JSON.stringify(mangaHistoryTmp, null, 4)
            );
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
    // Hide mangaList
    toggle(document.getElementById("manga-list"), true);
    // Hide buttons
    toggle(document.getElementsByClassName("buttons")[0], true);
    // Display #editor
    toggle(document.getElementById("editor"), false);
    // Focus on textarea
    document.getElementById("editor-ta").focus();
}

function clearHistory() {
    console.log("Clearing history...");

    // Clear mangaHistory
    browser.storage.local.set({mangaHistory: []});
    // Clear mangaList
    populateHistory([]);
}
