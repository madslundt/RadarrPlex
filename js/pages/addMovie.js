const Poster = require('../poster');

module.exports = (data, pageBody, openPage) => {
    let profiles = [];
    let folders = [];

    chrome.runtime.sendMessage({ endpoint: 'profile' }, resp => {
        if(!resp.err) {
            profiles = resp.res.body;
        } else {
            // TODO: Warn
        }
    });
    chrome.runtime.sendMessage({ endpoint: 'rootfolder' }, resp => {
        if(!resp.err) {
            folders = resp.res.body;
        } else {
            // TODO: Warn
        }
    });

    const bar = document.createElement('div');
    bar.classList.add('filter-bar');
    const backBtn = document.createElement('button');
    backBtn.setAttribute('class', 'btn btn-sm btn-default');
    backBtn.innerHTML = '<span class="glyphicon chevron-left"></span> Back';
    backBtn.addEventListener('click', () => openPage('movies'));
    bar.appendChild(backBtn);
    pageBody.appendChild(bar);

    const results = document.createElement('div');
    results.classList.add('radarr-add-movie-results');

    const termInput = document.createElement('input');
    termInput.setAttribute('type', 'text');
    termInput.setAttribute('placeholder', 'Start typing the name of a movie you want to add ...');
    termInput.setAttribute('class', 'form-control radarr-movie-add-input');
    termInput.addEventListener('keyup', e => {
        if(e.keyCode == 13) {
            const params = {
                term: e.target.value
            };
            while(results.hasChildNodes()) {
                results.removeChild(results.lastChild);
            }
            chrome.runtime.sendMessage({ endpoint: 'movieLookup', params }, resp => {
                if(!resp.err) {
                    for(var s in resp.res.body) {
                        const movie = resp.res.body[s];
                        const movieResult = document.createElement('div');
                        movieResult.classList.add('radarr-movie');
                        movieResult.appendChild(Poster.createMovie(movie, () => openPage('movieDetail', movie), false));

                        const title = document.createElement('h2');
                        const statusLabel = movie.status == 'released' ? 'info' : 'danger';
                        title.innerHTML = movie.title + ' <span class="year">(' + movie.year + ')</span> <span class="label label-default">' + movie.studio + '</span><span class="label label-' + statusLabel + '">' + movie.status + '</span>';
                        movieResult.appendChild(title);

                        const overview = document.createElement('p');
                        overview.textContent = movie.overview.slice(0, 300) + '...';
                        movieResult.appendChild(overview);

                        const folderGroup = document.createElement('div');
                        folderGroup.classList.add('input');
                        movieResult.appendChild(folderGroup);
                        const folderLabel = document.createElement('label');
                        folderLabel.textContent = 'Path';
                        folderGroup.appendChild(folderLabel);
                        const folderSelect = document.createElement('select');
                        for(var f in folders) {
                            const option = document.createElement('option');
                            option.setAttribute('value', folders[f].path);
                            option.textContent = folders[f].path;
                            folderSelect.appendChild(option);
                        }
                        folderGroup.appendChild(folderSelect);

                        const profileGroup = document.createElement('div');
                        profileGroup.classList.add('input');
                        movieResult.appendChild(profileGroup);
                        const profileLabel = document.createElement('label');
                        profileLabel.textContent = 'Profile';
                        profileGroup.appendChild(profileLabel);
                        const profileSelect = document.createElement('select');
                        for(var p in profiles) {
                            const option = document.createElement('option');
                            option.setAttribute('value', profiles[p].id);
                            option.textContent = profiles[p].name;
                            profileSelect.appendChild(option);
                        }
                        profileGroup.appendChild(profileSelect);

                        const addBtn = document.createElement('button');
                        addBtn.setAttribute('class', 'btn btn-lg btn-success pull-right');
                        addBtn.innerHTML = '<span class="glyphicon plus"></span>';
                        addBtn.addEventListener('click', () => {
                            const params = {
                                tmdbId: movie.tmdbId,
                                imdbId: movie.imdbId,
                                title: movie.title,
                                qualityProfileId: profileSelect.value,
                                titleSlug: movie.titleSlug,
                                images: [],
                                genres: movie.genres,
                                rootFolderPath: folderSelect.value,
                                monitored: true,
                                addOptions: {}
                            };
                            chrome.runtime.sendMessage({ endpoint: 'movieAdd', params }, resp => {
                                if(!resp.err) {
                                    Storage.collections.movies = null;
                                    openPage('movies');
                                } else {
                                    // TODO: Warn
                                }
                            });
                        });
                        movieResult.appendChild(addBtn);

                        results.appendChild(movieResult);
                    }
                } else {
                    // TODO: Replace this with alert maker
                    const warning = document.createElement('p');
                    warning.classList.add('radarr-alert');
                    warning.innerHTML = '<i class="radarr-warn glyphicon circle-exclamation-mark"></i> Can\'t connect to Radarr. Please check API settings.';
                    pageBody.appendChild(warning);
                }
            });
        }
    });
    pageBody.appendChild(termInput);
    pageBody.appendChild(results);
    termInput.focus();
};
