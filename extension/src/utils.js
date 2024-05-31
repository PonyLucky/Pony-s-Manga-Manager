function cleanText(text) {
    return text.replace('\n', '').trim();
}

async function getContentPage(url) {
    // Get manga page.
    let response = await fetch(url);
    let html = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    // DEBUG
    if (this.DEBUG) console.log("Doc: " + doc);
    // Return body.
    return doc.getElementsByTagName("body")[0];
}
