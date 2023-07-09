class Mangaread {
    static DEBUG = false;
    static url = "https://www.mangaread.org/manga/";
    static async check(url) {
        // DEBUG
        if (this.DEBUG) {
            console.log("URL: " + url);
            console.log(this.url, url.startsWith(this.url));
        }
        if (
            url.startsWith(this.url)
            && url.includes("/chapter")
            && url.endsWith("/")
        ) {
            // Extract manga info
            return await this.extractInfo(url).then(info => info)
        }
        return undefined;
    }

    static async extractInfo(url) {
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

        // Get content page
        await this.getContentPage(mangaChapterInfo.url)
        .then(async (doc) => {
            // Get cover
            mangaChapterInfo.cover = await this.getCover(doc)
                .then(cover => cover)
                .catch(err => console.log("Error: " + err));
        }).catch((err) => {
            console.log("Error: " + err);
        });
    
        // DEBUG
        if (this.DEBUG) console.log(
            "ExtractInfo: "
            + JSON.stringify(mangaChapterInfo, null, 2)
        );
    
        // Return info.
        return mangaChapterInfo;
    }

    static async getContentPage(url) {
        // Get manga page.
        let response = await fetch(url);
        let html = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        // DEBUG
        if (this.DEBUG) {
            console.log("HTML: " + html);
            console.log("Doc: " + doc);
        }
        // Return body.
        return doc.getElementsByTagName("body")[0];
    }

    static async getCover(doc) {
        // Get image container
        let imageContainer = doc.getElementsByClassName("summary_image")[0];
        // Get image element
        let image = imageContainer.getElementsByTagName("img")[0];
        // Get image URL
        let imageURL = image.getAttribute("data-src");
        if (imageURL === null) imageURL = image.getAttribute("src");

        // DEBUG
        if (this.DEBUG) console.log("Image URL: " + imageURL);

        // Get base64 image from URL
        const data = await fetch(imageURL);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            }
        });
    }

    static async getChapters(mangaUrl) {
        let listClass = "main";

        // Fetch manga page.
        let response = await fetch(mangaUrl);
        let html = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        // Get list of chapters.
        let list = doc.getElementsByClassName(listClass)[0];
        let chaptersA = list.getElementsByTagName("a")
        let chapters = [];

        // Get chapter URLs.
        for (let i = 0; i < chaptersA.length; i++) {
            let url = chaptersA[i].getAttribute("href");
            let index = url.lastIndexOf("/chapter-");
            chapters.push(url.substring(index + 9, url.length - 1));
        }

        // DEBUG
        if (this.DEBUG) console.log("Chapters: " + chapters);

        // Return chapters.
        return chapters;
    }
}
