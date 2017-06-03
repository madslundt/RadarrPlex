const moment = require('moment');

const Storage = require('../storage');
const Poster = require('../poster');

let moviesList = [];
let pageBody, openPage;

const createBar = (pagePage, openPage) => {
    const bar = document.createElement('div');
    bar.classList.add('filter-bar');
    const addBtn = document.createElement('button');
    addBtn.setAttribute('class', 'btn btn-sm btn-default');
    addBtn.innerHTML = '<span class="glyphicon plus"></span> Add Movie';
    addBtn.addEventListener('click', () => openPage('addMovie'));
    bar.appendChild(addBtn);

    const syncBtn = document.createElement('button');
    syncBtn.setAttribute('class', 'btn btn-sm btn-default');
    const syncContent = '<span class="glyphicon signal"></span> RSS Sync';
    syncBtn.innerHTML = syncContent;
    syncBtn.addEventListener('click', () => {
        syncBtn.innerHTML = '<div class="loading"></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RSS Sync';
        chrome.runtime.sendMessage({ endpoint: 'commandRun', params: { name: 'RssSync' } }, resp => {
            syncBtn.innerHTML = syncContent;
        });
    });
    bar.appendChild(syncBtn);

    const updateBtn = document.createElement('button');
    updateBtn.setAttribute('class', 'btn btn-sm btn-default');
    const updateContent = '<span class="glyphicon refresh"></span> Update Library';
    updateBtn.innerHTML = updateContent;
    updateBtn.addEventListener('click', () => {
        updateBtn.innerHTML = '<div class="loading"></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Update Library';
        chrome.runtime.sendMessage({ endpoint: 'commandRun', params: { name: 'RefreshMovies' } }, resp => {
            updateBtn.innerHTML = updateContent;
        });
    });
    bar.appendChild(updateBtn);

    const sortGroup = document.createElement('div');
    sortGroup.setAttribute('class', 'btn-group pull-right');
    const createSortBtn = (name, icon, filterFn) => {
        const sortBtn = document.createElement('button');
        sortBtn.setAttribute('class', 'btn btn-sm btn-default');
        sortBtn.setAttribute('title', name);
        sortBtn.addEventListener('click', () => createList(filterFn));
        const sortIcon = document.createElement('span');
        sortIcon.setAttribute('class', 'glyphicon ' + icon);
        sortBtn.appendChild(sortIcon);
        sortGroup.appendChild(sortBtn);
    };
    createSortBtn('All', 'unchecked', null);
    createSortBtn('Released', 'bookmark', movie => movie.released);
    // createSortBtn('Continuing', 'play', movie => movie.status == 'continuing');
    // createSortBtn('Ended', 'stop', movie => movie.status == 'ended');
    // createSortBtn('Missing', 'warning-sign', movie => movie.episodeFileCount < movie.totalEpisodeCount);

    pageBody.appendChild(bar);
};

const createList = (filterFn = null) => {
    let movies = moviesList;
    // Sort the movies by cinema date
    for(let s in movies) {
        if(typeof movies[s].inCinemas == 'undefined') {
            delete movies[s];
        }
    }
    const thisYear = new Date().getFullYear();
    movies = movies
        .filter(a => new Date(a.inCinemas).getFullYear() >= thisYear)
        .sort((a, b) => moment(a.inCinemas).diff(moment(b.inCinemas)));

    // If we are using a filter
    if(filterFn != null) {
        for(var s in movies) {
            if(!filterFn(movies[s])) {
                delete movies[s];
            }
        }
    }

    // Create the list of movies
    let posters = document.querySelector('.radarr-posters');
    if(posters != null) {
        while(posters.hasChildNodes()) {
            posters.removeChild(posters.lastChild);
        }
    } else {
        posters = document.createElement('div');
        posters.classList.add('radarr-posters');
        pageBody.appendChild(posters);
    }

    for(let s in movies) {
        const poster = Poster.createMovie(movies[s], () => openPage('movieDetail', movies[s]));
        posters.appendChild(poster);
    }
}

module.exports = (movies, body, open) => {
    moviesList = movies;
    pageBody = body;
    openPage = open;

    createBar();
    createList();
};
