class Sync {
    constructor(url='') {
        // Port is '7777' because '77' is the decimal ASCII code for 'M'
        // So '7777' is 'MM' -> MangaManager
        this.url = url;
    }

    async fetch(path, params = {}) {
        let error = {
            status: 'error',
            message: 'Failed to fetch data from server.',
            data: []
        }
        return await fetch(this.url + path, params)
            .then(res => res.json())
            .then(data => data)
            .catch(() => error)
    }

    async test() {
        if (this.url.length === 0) return false;
        let response = await this.fetch('/test');
        let syncResult = document.getElementById('sync-result');
        syncResult.textContent = response.message;
        return response.status === 'success';
    }

    async getMangaHistory() {
        if (this.url.length === 0) return [];
        let response = await this.fetch('/manga');
        return response.data || [];
    }

    async saveMangaHistory() {
        if (this.url.length === 0) return false;
        let mangaHistory = await browser.storage.local.get("mangaHistory")
            .then((res) => res.mangaHistory)
            .catch(() => []) || [];
        let response = await this.fetch('/manga', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mangaHistory)
        });
        return response.status === 'success';
    }
}
