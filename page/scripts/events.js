class Events {
    static init() {
        // Manga info buttons
        document.getElementById("manga-info-read")
            .addEventListener("click", Events.read);
        document.getElementsByClassName("manga-info-details-chapters")[0]
            .addEventListener("click", Events.infoChapters);
        // Back button
        document.getElementById("back-button")
            .addEventListener("click", Events.back);
        // Search input
        document.getElementById("search-input")
            .addEventListener("input", Events.search);
        // Settings buttons
        document.getElementById("settings-button")
            .addEventListener("click", Events.settings);
        // -- Manga list
        document.getElementById("save-list")
            .addEventListener("click", Events.saveList);
        document.getElementById("upload-list")
            .addEventListener("click", Events.uploadList);
        document.getElementById("clear-list")
            .addEventListener("dblclick", Events.clearList);
        document.getElementById("auto-add-checkbox")
            .addEventListener("click", Events.autoAdd);
        // -- Manga info
        document.getElementById("remove-info")
            .addEventListener("dblclick", Events.removeInfo);
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
            let child = children[i];
            if (child.dataset.elmt === elmt || child.tagName !== "DIV") {
                toggle(children[i], false);
            }
            else toggle(children[i], true);
        }
    }
    static saveList() {
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
    static uploadList() {
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
                // Clear local storage
                browser.storage.local.clear();
                // Save mangaHistory
                browser.storage.local.set({mangaHistory: mangaHistory});
                // Create mangaHistory object
                let mangaHistoryObj = new MangaHistory();
                // Populate mangaList and covers
                mangaHistoryObj.populate(mangaHistory);
                mangaHistoryObj.fillCovers();
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
    static clearList() {
        // Clear local storage
        browser.storage.local.clear();
        // Clear mangaList
        (new MangaHistory()).populate([]);
        // Run settings
        Events.settings();
    }
    static removeInfo() {
        /* Remove manga from history */
        // Get mangaInfo
        let mangaInfo = document.getElementById("manga-info");
        // Get manga
        let manga = JSON.parse(mangaInfo.dataset.manga);
        // Get mangaHistory
        browser.storage.local.get("mangaHistory", (data) => {
            let mangaHistory = data.mangaHistory || [];
            // Remove manga from mangaHistory
            mangaHistory = mangaHistory.filter((m) => {
                return m.manga !== manga.manga;
            });
            // Save mangaHistory
            browser.storage.local.set({mangaHistory: mangaHistory});
            // Clear manga from mangaCovers
            browser.storage.local.remove(manga.manga);
            // Click back button
            document.getElementById("back-button").click();
            // Create mangaHistory object
            let mangaHistoryObj = new MangaHistory();
            // Populate mangaList and fill covers
            mangaHistoryObj.populate(mangaHistory);
            mangaHistoryObj.fillCovers();
            // Run settings
            Events.settings();
        });
    }
    static async autoAdd() {
        // Get current mangaSettings if any
        let mangaSettings = await browser.storage.local.get("mangaSettings")
            .then((data) => {
                return data.mangaSettings || {};
            }
        );
        // Get autoAdd checkbox
        let autoAdd = document.getElementById("auto-add-checkbox");
        // If autoAdd is checked
        if (autoAdd.checked) {
            // Add mangaSettings.autoAdd
            mangaSettings.autoAdd = true;
        }
        // Else
        else {
            // Auto add is false
            mangaSettings.autoAdd = false;
        }
        // Save mangaSettings
        browser.storage.local.set({mangaSettings: mangaSettings});
    }
    static search() {
        // Get search input
        let searchInput = document.getElementById("search-input");
        // Get search value
        let searchValue = searchInput.value;
        // If search value is empty
        if (searchValue === "") {
            // Show all manga
            let mangaItems = document.getElementsByClassName("manga-item");
            for (let i = 0; i < mangaItems.length; i++) {
                toggle(mangaItems[i], false);
            }
        }
        // Else
        else if (searchValue.length > 1) {
            // Get mangaItems
            let mangaItems = document.getElementsByClassName("manga-item");
            // For each mangaItem
            for (let i = 0; i < mangaItems.length; i++) {
                // Get mangaItem
                let mangaItem = mangaItems[i];
                // Get manga title
                let mangaTitle = mangaItem.getElementsByTagName("p")[0].textContent;
                // If manga title contains search value
                if (mangaTitle.toLowerCase().includes(searchValue.toLowerCase())) {
                    // Show mangaItem
                    toggle(mangaItem, false);
                }
                // Else
                else {
                    // Hide mangaItem
                    toggle(mangaItem, true);
                }
            }
        }
    }
}
