const THEMES = {
    "default": [
        ["--bg-color-body", "#1e1e1e"],
        ["--bg-color-link", "#004edf"],
        ["--scrollbar-track-color", "#303030"],
        ["--scrollbar-thumb-color", "#424242"],
        ["--text-color-body", "#fff"],
        ["--button-text-color", "#2196f3"],
        ["--button-text-color-hover", "#1e88e5"],
        ["--button-text-color-active", "#1976d2"],
        ["--red-button-text-color", "#f44336"],
        ["--red-button-text-color-hover", "#e53935"],
        ["--red-button-text-color-active", "#d32f2f"],
        ["--settings-checkbox-bg-color", "var(--scrollbar-track-color)"],
        ["--settings-checkbox-checked-color", "var(--text-color-body)"],
        ["--manga-info-description-bg-color", "#404040"],
    ],
    "light": [
        ["--bg-color-body", "#fff"],
        ["--bg-color-link", "#eaf0fb"],
        ["--scrollbar-track-color", "#e0e0e0"],
        ["--scrollbar-thumb-color", "#bdbdbd"],
        ["--text-color-body", "#000"],
        ["--button-text-color", "#2196f3"],
        ["--button-text-color-hover", "#1e88e5"],
        ["--button-text-color-active", "#1976d2"],
        ["--red-button-text-color", "#f44336"],
        ["--red-button-text-color-hover", "#e53935"],
        ["--red-button-text-color-active", "#d32f2f"],
        ["--settings-checkbox-bg-color", "transparent"],
        ["--settings-checkbox-checked-color", "transparent"],
        ["--manga-info-description-bg-color", "#f5f5f5"],
    ],
    "oled": [
        ["--bg-color-body", "#000"],
        ["--bg-color-link", "#004edf"],
        ["--scrollbar-track-color", "#303030"],
        ["--scrollbar-thumb-color", "#424242"],
        ["--text-color-body", "#fff"],
        ["--button-text-color", "#2196f3"],
        ["--button-text-color-hover", "#1e88e5"],
        ["--button-text-color-active", "#1976d2"],
        ["--red-button-text-color", "#f44336"],
        ["--red-button-text-color-hover", "#e53935"],
        ["--red-button-text-color-active", "#d32f2f"],
        ["--settings-checkbox-bg-color", "var(--scrollbar-track-color)"],
        ["--settings-checkbox-checked-color", "var(--text-color-body)"],
        ["--manga-info-description-bg-color", "#404040"],
    ],
}

class Themes {
    static apply(theme) {
        let root = document.documentElement;
        for (let i = 0; i < THEMES[theme].length; i++) {
            root.style.setProperty(THEMES[theme][i][0], THEMES[theme][i][1]);
        }
    }
    static list() {
        return Object.keys(THEMES);
    }
}
