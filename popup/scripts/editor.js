// Handle editor buttons
document.getElementById("editor-save").addEventListener("click", saveEditor);
document.getElementById("editor-cancel").addEventListener("click", cancelEditor);

function saveEditor() {
    let editor = document.getElementById("editor-ta");
    try {
        let mangaHistory = JSON.parse(editor.value);
        // Save mangaHistory to json file
        browser.storage.local.set({mangaHistory: mangaHistory});
        // Clear editor
        editor.value = "";
        // Populate mangaList
        populateHistory(mangaHistory);

        // Hide editor
        toggle(document.getElementById("editor"), true);
        // Show mangaList
        toggle(document.getElementById("manga-list"), false);
        // Show buttons
        toggle(document.getElementsByClassName("buttons")[0], false);
    }
    catch (e) {
        console.log("Error while parsing JSON: " + e);
        // Add error class
        editor.classList.add("error");
    }
}

function cancelEditor() {
    // Hide editor
    toggle(document.getElementById("editor"), true);
    // Show mangaList
    toggle(document.getElementById("manga-list"), false);
    // Show buttons
    toggle(document.getElementsByClassName("buttons")[0], false);
}
