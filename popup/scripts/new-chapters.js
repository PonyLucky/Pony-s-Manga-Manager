// DEBUG
const DEBUG = false;

async function fetchNewChapters(url, number) {
    // DEBUG
    if (DEBUG) {
        console.log("URL: " + url);
        console.log("Number: " + number);
    }

    // Strategy pattern to select website to use.
    let website = null;
    if (url.startsWith(Mangaread.url)) {
        website = Mangaread;
    } else if (url.startsWith(Mangakik.url)) {
        website = Mangakik;
    } else if (url.startsWith(NeatManga.url)) {
        website = NeatManga;
    } else return null;

    // Get chapters.
    let mangaChapters = await website.getChapters(url)
        .then(chapters => chapters)
        .catch(() => []);

    // DEBUG
    if (DEBUG) console.log(mangaChapters);

    // Return null if no chapters.
    if (mangaChapters.length == 0) return 0;
    // Get index of chapter.
    let index = mangaChapters.indexOf(number);

    // DEBUG
    if (DEBUG) console.log(index);

    // Return null if chapter not found.
    if (index == -1) return 0;
    // Return number of new chapters.
    return index;
}