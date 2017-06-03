let options = {
    api: {
        key: '',
        base: 'http://localhost:7878',
        radarr_base: '',
        poll: 60
    },
    plexUrls: []
};

const Storage = {
    load: () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (items) => {
                Object.assign(options, items);
                resolve(options);
            });
        });
    },
    save: (opts) => {
        return new Promise((resolve) => {
            chrome.storage.sync.set(opts, () => {
                options = opts;
                resolve();
            });
        });
    },
    get: () => {
        return options;
    },
    collections: {
        movies: null
    }
};

module.exports = Storage;
