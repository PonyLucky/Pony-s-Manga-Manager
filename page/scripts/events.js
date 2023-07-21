class Events {
    static init() {
        // Settings buttons
        document.getElementById("save-button")
            .addEventListener("click", Events.save);
        document.getElementById("upload-button")
            .addEventListener("click", Events.upload);
        document.getElementById("clear-button")
            .addEventListener("dblclick", Events.clear);
        // Manga info buttons
        document.getElementById("manga-info-read")
            .addEventListener("click", Events.read);
        document.getElementsByClassName("manga-info-details-chapters")[0]
            .addEventListener("click", Events.infoChapters);
        // Settings button
        document.getElementById("settings-button")
            .addEventListener("click", Events.settings);
        // Back button
        document.getElementById("back-button")
            .addEventListener("click", Events.back);
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
            // Run settings
            Events.settings();
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
                // Clear mangaCovers
                browser.storage.local.set({mangaCovers: {}});
                // Populate mangaList
                (new MangaHistory).populate(mangaHistory, {});
                // Run settings
                Events.settings();
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
        // Clear mangaCovers
        browser.storage.local.set({mangaCovers: {}});
        // Clear mangaList
        (new MangaHistory).populate([]);
        // Run settings
        Events.settings();
    }
    static read() {
        let read = document.getElementById("manga-info-read");
        let url = read.getAttribute("href");
        // Open url in new tab
        browser.tabs.create({url: url});
        // Close popup
        window.close();
    }
    static infoChapters() {
        let info = document.getElementById("manga-info");
        let data = JSON.parse(info.dataset.manga);
        console.log(data);
        (new Chapters).list(data);
    }
    static settings() {
        let settings = document.getElementById("settings");
        let mList = document.getElementById("manga-list");
        let mInfo = document.getElementById("manga-info");
        let mChapters = document.getElementById("manga-chapters");
        let back = document.getElementById("back-button");

        // Check which element is visible
        if (!mList.classList.contains("hide")) {
            // Toggle mangaList and settings
            toggle(mList, true);
            toggle(back, false);
            toggle(settings, false);
            // Save to dataset
            settings.dataset.elmt = mList.id;
        }
        else if (!mInfo.classList.contains("hide")) {
            // Toggle mangaInfo and settings
            toggle(mInfo, true);
            toggle(back, false);
            toggle(settings, false);
            // Save to dataset
            settings.dataset.elmt = mInfo.id;
        }
        else if (!mChapters.classList.contains("hide")) {
            // Toggle mangaChapters and settings
            toggle(mChapters, true);
            toggle(back, false);
            toggle(settings, false);
            // Save to dataset
            settings.dataset.elmt = mChapters.id;
        }
        // Else means settings is visible
        else if (settings.dataset.elmt) {
            // Toggle settings and previous element
            toggle(settings, true);
            toggle(
                document.getElementById(settings.dataset.elmt),
                false
            );
            if (settings.dataset.elmt === "manga-list") {
                toggle(back, true);
            }
            // Clear dataset
            settings.dataset.elmt = "";
        }

        // Toggle settings sections
        let elmt = settings.dataset.elmt;
        // Get children
        let children = settings.children;
        // For each, if dataset.elmt is not equal to elmt, hide
        for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.elmt === elmt) {
                toggle(children[i], false);
            }
            else toggle(children[i], true);
        }
    }
    static back() {
        let back = document.getElementById("back-button");
        let mInfo = document.getElementById("manga-info");
        let mChapters = document.getElementById("manga-chapters");
        let settings = document.getElementById("settings");

        // If chapter visible, hide it and show mangaInfo
        if (!mChapters.classList.contains("hide")) {
            // Toggle mangaInfo and mangaChapters
            toggle(mInfo, false);
            toggle(mChapters, true);
        }
        // If mangaInfo visible, hide it and show mangaList
        else if (!mInfo.classList.contains("hide")) {
            // Toggle mangaList and mangaInfo
            toggle(document.getElementById("manga-list"), false);
            toggle(mInfo, true);
            // Hide back button
            toggle(back, true);
        }
        // If settings visible, run settings function
        else if (!settings.classList.contains("hide")) {
            Events.settings();
        }
    }
}
