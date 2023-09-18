class Manhwatop {
    static DEBUG = false;
    static url = "https://manhwatop.com/manga/";
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
        await getContentPage(mangaChapterInfo.url)
        .then(async (doc) => {
            // Get cover
            mangaChapterInfo.cover = await this.getCover(doc)
                .then(cover => cover)
                .catch(err => console.log("Error: " + err));
            // Get author
            mangaChapterInfo.author = this.getAuthor(doc);
            // Get status
            mangaChapterInfo.status = this.getStatus(doc);
            // Get genres
            mangaChapterInfo.genres = this.getGenres(doc);
            // Get last release date
            mangaChapterInfo.lastDate = this.getLastReleaseDate(doc);
            // Get description
            mangaChapterInfo.description = this.getDescription(doc);
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

    static async getCover(doc) {
        // Get image container
        let imageContainer = doc.getElementsByClassName("summary_image")[0];
        // Get image element
        let image = imageContainer.getElementsByTagName("img")[0];
        // Get image URL
        let imageURL = image.getAttribute("data-src");
        if (imageURL === null) imageURL = image.getAttribute("src");
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

    static getAuthor(doc) {
        let authorClass = "author-content";
        let author = doc.getElementsByClassName(authorClass)[0];
        if (author !== undefined) {
            return cleanText(author.innerText);
        }
        return undefined;
    }

    static getStatus(doc) {
        let statusHeaders = doc.getElementsByTagName("h5");
        for (let i = 0; i < statusHeaders.length; i++) {
            if (statusHeaders[i].innerText.includes("Status")) {
                return cleanText(statusHeaders[i].parentElement
                    .nextElementSibling.innerText);
            }
        }
        return undefined;
    }

    static getGenres(doc) {
        let genreClass = "genres-content";
        let genres = doc.getElementsByClassName(genreClass)[0];
        if (genres !== undefined) {
            genres = genres.getElementsByTagName("a");
            let genresList = []
            for (let i = 0; i < genres.length; i++) {
                genresList.push(cleanText(genres[i].innerText));
            }
            return genresList;
        }
        return undefined;
    }

    static getLastReleaseDate(doc) {
        let chapterClass = "chapter-release-date";
        // Get last chapter in date.
        let chapter = doc.getElementsByClassName(chapterClass)[0];
        if (chapter !== undefined) {
            return cleanText(chapter.innerText);
        }
        return undefined;
    }

    static getDescription(doc) {
        let descriptionClass = "description-summary";
        let description = doc.getElementsByClassName(descriptionClass)[0];
        if (description !== undefined) {
            let ctn = description.firstElementChild;
            // If first child has strong tag, remove it.
            if (ctn.firstElementChild.getElementsByTagName("strong").length > 0) {
                ctn.removeChild(ctn.firstElementChild);
            }
            // Extract text.
            description = ctn.innerText;
            return cleanText(description);
        }
        return undefined;
    }

    static async getChapters(mangaUrl) {
        // TODO: Fix this. 'list' seems to be empty.
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
