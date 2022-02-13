const list = findElement('.films__list');
const elAddForm = findElement('#film_add_form');
const elSearchForm = findElement('#films_search');
const elFilmTemplate = findElement('.films-item-template').content;
const elSearchInput = findElement('.search__title');
const searchSelect = findElement('.search__genre');
const elSortSelect = findElement('#films_sort');
const searchResult = findElement('.search__result');
const pgButtons = findElement('.page__buttons');
const bookmarkedList = findElement('.bookmarked');
const elBookmarkTemplate = findElement('.bookmark-item-template').content;
const resetBtn = findElement('#reset');

// let searchOptions = JSON.parse(window.localStorage.getItem('searchOptions')) || ['none', 'all'];

films = JSON.parse(window.localStorage.getItem('films')) || films;
let bookmarkedFilms = JSON.parse(window.localStorage.getItem('bookmarked')) || [];

if (window.localStorage.getItem('films') == null) {
    window.localStorage.setItem('films', JSON.stringify(films));
}

const calcDate = (ms) => {
    const date = new Date(ms);
    const day = String(date.getDate());
    const month = String(date.getMonth() + 1);
    const year = String(date.getFullYear());

    return [day.padStart(2, 0), month.padStart(2, 0), year].join('.');
}

const calcMs = (date) => new Date(date).getTime();
const getFilmGenres = (film) => film.genres.join(', ');

const renderGenres = (db) => {
    const genres = [];
    db.forEach((item) => {
        const filtered = item.genres.filter((genre) => !genres.includes(genre));
        filtered.forEach((genre) => genres.push(genre));
    });

    searchSelect.innerHTML = null;
    const newAllOpt = document.createElement('option');
    newAllOpt.textContent = 'All';
    newAllOpt.value = 'All';
    const optionsFragment = document.createDocumentFragment();
    optionsFragment.appendChild(newAllOpt);

    genres.forEach((genre) => {
        const newOpt = document.createElement('option');
        newOpt.textContent = genre;
        newOpt.value = genre;
        optionsFragment.appendChild(newOpt);
    })

    searchSelect.appendChild(optionsFragment);
}

const handleSort = () => {
    const sortValue = elSortSelect.value;

    if (sortValue == 'A-Z') {
        renderFilms(sortFilmsByTitle(films));
    } else if (sortValue == 'Z-A') {
        renderFilms(sortFilmsByTitle(films).reverse());
    } else if (sortValue == 'O-N') {
        renderFilms(sortFilmsByRelease(films));
    } else if (sortValue == 'N-O') {
        renderFilms(sortFilmsByRelease(films).reverse());
    }
}

const sortFilmsByTitle = (db) => {
    return db.sort((a, b) => {
        if (a.title.toLowerCase()> b.title.toLowerCase()) {
            return 1;
        } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
            return -1;
        } else {
            return 0;
        }
    });
}

const sortFilmsByRelease = (db) => {
    return db.sort((a, b) => {
        if (a.release_date > b.release_date) {
            return 1;
        } else if (a.release_date < b.release_date) {
            return -1;
        } else {
            return 0;
        }
    });
}

const addToBookmark = (id) => {
    const bookmarkedFilm = films.find((item) => item.id === id);

    if (bookmarkedFilms.length <= 0) {
        bookmarkedFilms.unshift(bookmarkedFilm);
        window.localStorage.setItem('bookmarked', JSON.stringify(bookmarkedFilms));
        renderBookmarked(bookmarkedFilms);
        findElement('.bookmark__title').style.display = 'block';
    } else {
        if (bookmarkedFilms.find((elem) => elem.id === id)) {
            alert('Already exists')
        } else if (!bookmarkedFilms.find((elem) => elem.id === id)) {
            bookmarkedFilms.unshift(bookmarkedFilm);
            window.localStorage.setItem('bookmarked', JSON.stringify(bookmarkedFilms));
            renderBookmarked(bookmarkedFilms);
            findElement('.bookmark__title').style.display = 'block';
        }
    }
}

const removeFilm = (id) => {
    const filmIndex = films.findIndex((elem) => elem.id === id);
    films.splice(filmIndex, 1);
    window.localStorage.setItem('films', JSON.stringify(films));
    renderFilms(films);

    if (bookmarkedFilms.find((elem) => elem.id === id)) {
        const bookmarkedFilmIndex = bookmarkedFilms.findIndex((elem) => elem.id === id);
        bookmarkedFilms.splice(bookmarkedFilmIndex, 1);
        window.localStorage.setItem('bookmarked', JSON.stringify(bookmarkedFilms));
        renderBookmarked(bookmarkedFilms);
    }
}

const showInfo = (id) => {
    const film = findElement(`[data-film-id~="${id}"]`);
    const filmOverview = findElement('.films__overview', film);

    filmOverview.classList.toggle('films__overview--active');
}

const handleList = (evt) => {
    const clicked = evt.target;
    const filmId = clicked.dataset.filmId;
    if (clicked.matches('.films__bookmark')) {
        addToBookmark(filmId);
    } else if (clicked.matches('.films__remove')) {
        removeFilm(filmId);
    } else if (clicked.matches('.films__info')) {
        showInfo(filmId);
    }
}

const handleDeleteBookmark = (evt) => {
    const clicked = evt.target;

    if (clicked.matches('.bookmark__button')) {
        const bookmarkId = clicked.dataset.filmId;
        const bookmarkIndex = bookmarkedFilms.findIndex((elem) => elem.id === bookmarkId);

        bookmarkedFilms.splice(bookmarkIndex, 1);

        window.localStorage.setItem('bookmarked', JSON.stringify(bookmarkedFilms));
        renderBookmarked(bookmarkedFilms);

        if (bookmarkedFilms.length <= 0) {
            findElement('.bookmark__title').style.display = 'none';
        }
    }
}

const renderBookmarked = (db) => {
    bookmarkedList.innerHTML = null;
    const bookmarkFragment = document.createDocumentFragment();

    db.forEach((item) => {
        const bookmark = elBookmarkTemplate.cloneNode(true);
        const button = findElement('.bookmark__button', bookmark);

        findElement('.bookmark__title', bookmark).textContent = item.title;
        button.dataset.filmId = item.id;
        button.parentNode.dataset.filmId = item.id;

        bookmarkFragment.appendChild(bookmark);
    });

    bookmarkedList.appendChild(bookmarkFragment);

    if (bookmarkedFilms.length <= 0) {
        findElement('.bookmark__title').style.display = 'none';
    } else {
        findElement('.bookmark__title').style.display = 'block';
    }
}

const handleSearch = (evt) => {
    evt.preventDefault();
    const searchTitle = elSearchInput.value.trim();
    const regex = new RegExp(searchTitle, 'gi');
    const searchGenre = searchSelect.value.trim();

    if (searchGenre == 'All') {
        const filtered = films.filter((film) => film.title.match(regex));
        renderFilms(filtered);
    } else if (searchGenre == 'All' && searchTitle == null) {
        renderFilms(films);
    } else if (searchTitle == null) {
        const filtered = films.filter((film) => film.genres.includes(searchGenre));
        renderFilms(filtered);
    } else {
        const filtered = films.filter((film) => film.title.match(regex) && film.genres.includes(searchGenre));
        renderFilms(filtered);
    }
}

const renderFilms = (db) => {
    const filmsFragment = document.createDocumentFragment();
    list.innerHTML = null;

    db.forEach((item) => {
        const film = elFilmTemplate.cloneNode(true);

        findElement('.films__img', film).src = item.poster;
        findElement('.films__img', film).alt = item.title + '\'s poster';
        findElement('.films__title', film).textContent = item.title;
        findElement('.films__date', film).innerHTML = '<i class="bi bi-calendar2-fill me-1"></i>' + calcDate(item.release_date);
        findElement('.films__overview', film).innerHTML = '<i class="bi bi-star-fill text-warning me-1"></i>' + item.overview;
        findElement('.genres__list', film).textContent = getFilmGenres(item);
        findElement('.card', film).parentNode.dataset.filmId = item.id;
        findElement('.films__bookmark', film).dataset.filmId = item.id;
        findElement('.films__remove', film).dataset.filmId = item.id;
        findElement('.films__info', film).dataset.filmId = item.id;

        filmsFragment.appendChild(film);
    });

    list.appendChild(filmsFragment);

    searchResult.textContent = 'Search results: ' + db.length;
}

const handleReset = () => {
    films = [];
    defaultFilms.forEach((elem) => {
        films.push(elem);
    })

    window.localStorage.setItem('films', JSON.stringify(films));
    renderFilms(films);

    bookmarkedFilms = [];
    window.localStorage.removeItem('bookmarked');
    renderBookmarked(bookmarkedFilms);
}

const handleAddFilm = (evt) => {
    evt.preventDefault();

    let filmTitle = findElement('.form__title').value;
    let filmPoster = findElement('.form__img').value;
    let filmOverview = findElement('.form__overview').value;
    let filmDate = findElement('.form__date').value;
    let filmGenres = findElement('.form__genres').value;

    if (!filmTitle || !filmPoster || !filmOverview || !filmDate || !filmGenres) {
        alert('Not all data is added');
    } else {
        let newFilmId = Number((Math.random(99)*1000000).toFixed());

        const newIdCheck = (id) => {
            films.forEach((elem) => {
                if (elem.id == id) {
                    id = Number((Math.random(99)*1000000).toFixed());
                    newIdCheck(id);
                } else {
                    newFilm.id = id;
                }
            });
            
            return id;
        }

        const newFilm = {
            id: newIdCheck(newFilmId),
            title: filmTitle.trim(),
            poster: filmPoster.trim(),
            overview: filmOverview.trim(),
            release_date: calcMs(filmDate),
            genres: filmGenres.trim().split(', '),
        }

        films.unshift(newFilm);
        renderFilms(films);
        window.localStorage.setItem('films', JSON.stringify(films));

        filmTitle = null;
        filmPoster = null;
        filmOverview = null;
        filmDate = null;
        filmGenres = null;
    }
}

renderFilms(films);
renderGenres(films);
renderBookmarked(bookmarkedFilms);
elAddForm.addEventListener('submit', handleAddFilm);
elSearchForm.addEventListener('submit', handleSearch);
elSortSelect.addEventListener('change', handleSort);
bookmarkedList.addEventListener('click', handleDeleteBookmark);
list.addEventListener('click', handleList);
resetBtn.addEventListener('click', handleReset);