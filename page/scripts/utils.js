function toggle(elmt, val) {
    if (val === undefined) {
        elmt.classList.toggle("hide");
    }
    else if (val === true) {
        elmt.classList.add("hide");
    }
    else if (val === false) {
        elmt.classList.remove("hide");
    }
}

function clear(target) {
    while (target.firstChild) {
        target.removeChild(target.firstChild);
    }
}

function selectWebsites(url) {
    // Strategy pattern to select website to use.
    let website = null;
    if (url.startsWith(Mangaread.url)) {
        website = Mangaread;
    } else if (url.startsWith(Mangakik.url)) {
        website = Mangakik;
    } else if (url.startsWith(NeatManga.url)) {
        website = NeatManga;
    } else return null;
    return website;
}
