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
