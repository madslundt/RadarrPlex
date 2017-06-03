const moment = require('moment');
const path = require('path');

const Storage = require('../storage');
const Poster = require('../poster');

module.exports = (movie, pageBody, openPage) => {
    chrome.runtime.sendMessage({ endpoint: 'movieDetail', params: { movieId: movie.id } }, resp => {
        if(!resp.err) {
            const bg = document.createElement('div');
            bg.classList.add('radarr-background');
            const url = path.join(Storage.get().api.base, movie.images[0] ? movie.images[0].url : '');
            bg.style.backgroundImage = 'url(' + url + ')';
            document.querySelector('#content').appendChild(bg);

            const movieResult = document.createElement('div');
            movieResult.classList.add('radarr-movie');
            movieResult.appendChild(Poster.createMovie(movie, null, false));
            const heading = document.createElement('h2');
            heading.textContent = movie.title;
            movieResult.appendChild(heading);
            pageBody.appendChild(movieResult);
        } else {
            // TODO: warn
        }
    });
};
