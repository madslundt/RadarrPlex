const Navbar = {
    create: (pageToggle) => {
        const navbar = document.querySelector('.nav-bar-right');

        if(navbar.querySelector('.radarr-btn')) {
            return;
        }

        const existingBtn = navbar.querySelector('.activity-btn').parentNode;
        const btn = existingBtn.cloneNode(true);
        btn.classList.remove('active');

        const link = btn.querySelector('a');
        link.setAttribute('class', 'radarr-btn');
        link.setAttribute('href', '#');
        link.setAttribute('title', 'Radarr');

        const icon = link.querySelector('i');
        const svg = document.createElement('img');
        svg.setAttribute('src', chrome.extension.getURL('img/Radarr.svg'));
        svg.setAttribute('width', 26);
        link.replaceChild(svg, icon);

        link.addEventListener('click', e => {
            e.preventDefault();
            pageToggle();
        });

        navbar.insertBefore(btn, existingBtn);

        const number = link.querySelector('.badge');
        number.classList.add('hidden');

        // Check the status of Radarr
        chrome.runtime.sendMessage({ endpoint: 'queue' }, resp => {
            if(!resp.err) {
                number.textContent = resp.res.length;
                number.classList.remove('hidden');
            } else {
                if(resp.err) {
                    Navbar.warn();
                }
            }
        });
    },
    warn: () => {
        const navbar = document.querySelector('.nav-bar-right');
        const btn = navbar.querySelector('.radarr-btn');

        const warning = document.createElement('i');
        warning.classList.add('radarr-warn');
        warning.classList.add('glyphicon');
        warning.classList.add('circle-exclamation-mark');
        btn.appendChild(warning);
    },
    removeWarn: () => {
        const navbar = document.querySelector('.nav-bar-right');
        const btn = navbar.querySelector('.radarr-btn');
        btn.querySelector('.radarr-warn').remove();
    }
};

module.exports = Navbar;
