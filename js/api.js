const request = require('superagent');
const path = require('path');

const Storage = require('./storage');

const API = {
    movies: () => API.get('movie'),
    movieLookup: ({ term }) => API.get('movie/lookup', { term }),
    movieDetail: ({ movieId }) => API.get('movie', { movieId }),
    movieAdd: (params) => API.post('movie', params),
    status: () => API.get('system/status'),
    calendar: ({ start, end }) => API.get('calendar', { start, end }),
    queue: () => API.get('queue'),
    profile: () => API.get('profile'),
    rootfolder: () => API.get('rootfolder'),
    commandRun: ({ name }) => {
        return new Promise(resolve => {
            const checkCommand = (id) => {
                API.get('command/' + id)
                    .then((res) => {
                        if(res.body.state != 'completed') {
                            window.setTimeout(() => checkCommand(id), 1000);
                        } else {
                            resolve();
                        }
                    });
            };

            API.post('command', { name })
                .then(res => {
                    window.setTimeout(() => checkCommand(res.body.id), 1000);
                });
        });
    },
    get: (endpoint, params = {}) => {
        const options = Storage.get();
        const url = path.join(options.api.base, 'api', endpoint);

        return request.get(url)
            .set('X-Api-Key', options.api.key)
            .query(params);
    },
    post: (endpoint, params = {}) => {
        const options = Storage.get();
        const url = path.join(options.api.base, 'api', endpoint);

        return request.post(url)
            .set('X-Api-Key', options.api.key)
            .send(params);
    }
};

module.exports = API;
