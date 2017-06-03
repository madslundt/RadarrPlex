const moment = require('moment');
const path = require('path');

const Storage = require('./storage');
const Page = require('./page');

const Poster = {

    createMovie: (movie, clickFn, text = true) => {
        const poster = document.createElement('div');
        poster.classList.add('radarr-poster');

        const posterCard = Poster.createCard(movie, clickFn);
        poster.appendChild(posterCard);

        if(text) {
            // TODO: Generalize text captions
            const title = document.createElement('div');
            title.classList.add('radarr-title');
            const srs = document.createElement('a');
            if(typeof clickFn == 'function') {
                srs.addEventListener('click', clickFn);
            }
            srs.setAttribute('href', '#');
            srs.textContent = movie.title;
            title.appendChild(srs);
            const date = document.createElement('div');
            date.classList.add('radarr-date');
            date.textContent = movie.year;
            title.appendChild(date);


            poster.appendChild(title);
        }

        return poster;
    },
    createCard: (movie, clickFn) => {
        const posterCard = document.createElement('div');
        posterCard.classList.add('radarr-postercard');
        if(typeof clickFn == 'function') {
            posterCard.addEventListener('click', clickFn);
        } else {
            posterCard.classList.add('postercard-noclick');
        }

        const cover = document.createElement('div');
        cover.classList.add('radarr-cover');
        const coverImage = document.createElement('div');
        coverImage.classList.add('radarr-cover-image');
        if (movie.downloaded) {
            coverImage.classList.add('radarr-movie-downloaded');
        } else if (movie.status === 'released') {
            coverImage.classList.add('radarr-movie-available');
        } else {
            coverImage.classList.add('radarr-movie-coming');
        }

        const options = Storage.get();
        for(let i in movie.images) {
            if(movie.images[i].coverType == 'poster') {
                let url = movie.images[i].url;
                if(url.indexOf('http') == -1) {
                    // Remove the URL Base from the relative URL and replace any double slashes
                    if(options.api.radarr_base) {
                        url = url.replace(options.api.radarr_base, '')
                            .replace(/([^:]\/)\/+/g, '/');
                    }
                    // Request a smaller sized poster
                    url = path.join(options.api.base, url).replace('.jpg', '-250.jpg');;
                }
                coverImage.style.backgroundImage = 'url(' + url + ')';
            }
        }

        cover.appendChild(coverImage);
        posterCard.appendChild(cover);

        return posterCard;
    }
};

module.exports = Poster;
