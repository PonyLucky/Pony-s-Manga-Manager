class Mangaread {
    static url = "https://www.mangaread.org/manga/";
    static check(url) {
        // DEBUG
        if (DEBUG) {
            console.log("URL: " + url);
            console.log(this.url, url.startsWith(this.url));
        }
        if (
            url.startsWith(this.url)
            && url.includes("/chapter")
            && url.endsWith("/")
        ) {
            // Extract manga info
            return this.extractInfo(url);
        }
    }

    static extractInfo(url) {
        let mangaChapterInfo = {};
        // Remove base URL and split into parts.
        let urlParts = url.replace(this.url, "").split("/");
    
        // Get manga name and format it to title case.
        mangaChapterInfo.manga = urlParts[0]
            .replace(/-/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());
        // Get chapter number.
        mangaChapterInfo.chapters = [urlParts[1].replace("chapter-", "")];
        // Append date in timestamp format.
        mangaChapterInfo.date = Date.now();
        // Append URL up to /chapter.
        mangaChapterInfo.url = this.url + urlParts[0] + "/";
    
        // DEBUG
        if (DEBUG) console.log(
            "ExtractInfo: "
            + JSON.stringify(mangaChapterInfo, null, 2)
        );
    
        // Return info.
        return mangaChapterInfo;
    }
}
