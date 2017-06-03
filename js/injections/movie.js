const moment = require('moment');

const Page = require('../page');

module.exports = (openPage) => {
    const checkPage = () => {
        const check = () => {
            // Detect whether we are on a movie homepage
            if(content.querySelector('.movie-details-row') != null) {
                window.setTimeout(wait, 200);
            } else if(checkCount < 5) {
                checkCount++;
                window.setTimeout(check, 500);
            } else {
                // Check when any URL is changed
                window.addEventListener('hashchange', checkPage);
            }
        };
        const wait = () => {
            if(content.querySelector('.studio-flag-container') == null) {
                window.setTimeout(wait, 200);
            } else {
                inject();
            }
        };

        const content = document.querySelector('#content');
        let checkCount = 0;
        window.setTimeout(check, 500);
    };
    // Check a second after page load
    window.setTimeout(checkPage, 500);

    const inject = () => {
        const content = document.querySelector('#content');
        const movieName = content.querySelector('.movie-details-row .item-title').textContent;
        chrome.runtime.sendMessage({ endpoint: 'movies' }, resp => {
            if(!resp.err) {
                let movies = null;
                for(var s in resp.res.body) {
                    if(resp.res.body[s].title == movieName) {
                        movies = resp.res.body[s];
                    }
                }

                if(movies != null) {
                    // Insert movie status next to studio flag
                    const studio = content.querySelector('.studio-flag-container');

                    const movieStatus = document.createElement('div');
                    movieStatus.classList.add('radarr-movie-status');
                    let status = 'default';
                    switch(movies.status) {
                        case 'ended':
                            status = 'danger';
                            break;
                        case 'continuing':
                            status = 'info';
                            break;
                    }
                    let html = '<span class="label label-' + status + '">' + movies.status + '</span>';
                    if(movies.inCinemas) {
                        html += ' Next airing ' + moment(movies.inCinemas).fromNow();
                    }
                    movieStatus.innerHTML = html;

                    studio.insertBefore(movieStatus, studio.querySelector('.studio-flag'));

                    const metadata = content.querySelector('.movie-details-metadata-container');
                    const manage = document.createElement('div');
                    const link = document.createElement('a');
                    link.setAttribute('href', '#');
                    link.textContent = 'Manage on Radarr';
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        openPage('movieDetail', movies);
                    });
                    manage.appendChild(link);
                    metadata.appendChild(manage);
                }
            }
        });
    };
};
