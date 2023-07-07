function chaptersList(history) {
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
