class Events {
    static init() {
        document.getElementById("save-button")
            .addEventListener("click", Events.save);
        document.getElementById("upload-button")
            .addEventListener("click", Events.upload);
        document.getElementById("clear-button")
            .addEventListener("dblclick", Events.clear);
    }
    static save() {
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

            // If mangaHistory is empty
            if (!mangaHistoryTmp || mangaHistoryTmp.length === 0) {
                console.log("No manga in history.");
                return;
            }

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
    }
    static upload() {
        // Create input element
        let input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.style.display = "none";
        // Add event listener
        input.addEventListener("change", (event) => {
            // Get file
            let file = event.target.files[0];
            // Check if file is valid
            if (!file || file.type !== "application/json") {
                console.log("Invalid file.");
                return;
            }
            // Read file
            let reader = new FileReader();
            reader.onload = (event) => {
                // Parse file
                let mangaHistory = JSON.parse(event.target.result);
                // Save mangaHistory
                browser.storage.local.set({mangaHistory: mangaHistory});
                // Populate mangaList
                (new MangaHistory).populate(mangaHistory);
            };
            reader.readAsText(file);
        });
        // Add to body
        document.body.appendChild(input);
        // Click input
        input.click();
        // Remove input
        document.body.removeChild(input);
    }
    static clear() {
        // Clear mangaHistory
        browser.storage.local.set({mangaHistory: []});
        // Clear mangaList
        (new MangaHistory).populate([]);
    }
}
