const list = document.querySelector('.films__list');
const elAddForm = document.querySelector('#film_add_form');
const elSearchForm = document.querySelector('#films_search');
const elFilmTemplate = document.querySelector('.films-item-template').content;
const elSearchInput = document.querySelector('.search__title');
const searchSelect = document.querySelector('.search__genre');
const elSortSelect = document.querySelector('#films_sort');
const searchResult = document.querySelector('.search__result');
var actualList = films;
searchResult.textContent = 'Search results: ' + actualList.length

const handleAddSubmit = (evt) => {
    evt.preventDefault();
    addNewFilm(films);
    renderFilms(sortFilms(films));
    renderGenres(getAllGenres(films));
    actualList = films;
    searchResult.textContent = 'Search results: ' + actualList.length;
};

const handleFindSubmit = (evt) => {
    evt.preventDefault();
    renderFilms(sortFilms(searchFilms(sortedByTitle(films), sortedByGenre(films))));
    actualList = sortFilms(searchFilms(sortedByTitle(films), sortedByGenre(films)));
    searchResult.textContent = 'Search results: ' + actualList.length;
};

const handleSortSubmit = (evt) => {
    evt.preventDefault();
    renderFilms(sortFilms(actualList));
}

const sortFilms = (db) => {
    const sortValue = elSortSelect.value;

    if (sortValue == 'A-Z') {
        return sortFilmsByTitle(db);
    } else if (sortValue == 'Z-A') {
        return sortFilmsByTitle(db).reverse();
    } else if (sortValue == 'O-N') {
        return sortFilmsByRelease(db);
    } else if (sortValue == 'N-O') {
        return sortFilmsByRelease(db).reverse();
    } else {
        console.error('err');
    }
}

const sortFilmsByTitle = (db) => {
    const sorted = db.sort((a,b) => {
        if (a.title > b.title) {
            return 1;
        } else if (a.title < b.title) {
            return -1;
        } else {
            return 0;
        }
    });

    return sorted;
}

const sortFilmsByRelease = (db) => {
    const sorted = db.sort((a,b) => {
        if (a.release_date > b.release_date) {
            return 1;
        } else if (a.release_date < b.release_date) {
            return -1;
        } else {
            return 0;
        }
    });

    return sorted;
}

const createGenresArr = string => string.split(', ');
const calcMs = date => new Date(String(date)).getTime();
const calcDate = ms => {
    const day = String(new Date(ms).getDate()).padStart(2, 0);
    const month = String(new Date(ms).getMonth() + 1).padStart(2, 0);
    const year = String(new Date(ms).getFullYear());
    const release = [day, month, year].join('.');

    return release;
};

const renderFilms = (db) => {
    list.innerHTML = null;

    db.forEach((elem) => {
        const itemTemplate = elFilmTemplate.cloneNode(true);
        const itemTitle = itemTemplate.querySelector('.films__title');
        const itemPoster = itemTemplate.querySelector('.films__img');
        const itemOverview = itemTemplate.querySelector('.films__overview');
        const itemDate = itemTemplate.querySelector('.films__date');
        const itemGenres = itemTemplate.querySelector('.genres__list');
    
        itemTitle.textContent = elem.title;
        itemPoster.src = elem.poster;
        itemGenres.textContent = elem.genres.join(', ');
        itemDate.innerHTML = '<i class="bi bi-calendar2-fill me-1"></i>' + calcDate(elem.release_date);
        itemOverview.innerHTML = '<i class="bi bi-star-fill text-warning me-1"></i>' + elem.overview;
    
        list.appendChild(itemTemplate);
    });
}

const addNewFilm = (db) => {
    const titleValue = document.querySelector('.form__title').value.trim();
    const imgValue = document.querySelector('.form__img').value.trim();
    const overviewValue = document.querySelector('.form__overview').value.trim();
    const dateValue = document.querySelector('.form__date').value;
    const genresValue = document.querySelector('.form__genres').value.trim();

    if (titleValue.length <= 0 || imgValue.length <= 0 || overviewValue.length <= 0 || dateValue.length <= 0 || genresValue.length <= 0) {
        alert('Not all data is correct');
    } else {
        db.unshift({
            id: String((Math.random(4) * 100000).toFixed(0)),
            title: titleValue,
            poster: imgValue,
            overview: overviewValue,
            release_date: calcMs(dateValue),
            genres: createGenresArr(genresValue),
        });
    }
}

const getAllGenres = (db) => {
    let allGenres = [];

    db.forEach((elem) => {
        elem.genres.forEach((e) => {
            if (!allGenres.includes(e)) {
                allGenres.push(e);
            }
        })
    })

    return allGenres.sort();
}

const renderGenres = (genres) => {
    searchSelect.innerHTML = null;
    const allOpt = document.createElement('option');

    allOpt.value = 'All';
    allOpt.textContent = 'All';
    searchSelect.appendChild(allOpt);

    genres.forEach((elem) => {
        const newOpt = document.createElement('option');

        newOpt.textContent = elem;
        newOpt.value = elem;

        searchSelect.appendChild(newOpt);
    });
}

const sortedByTitle = (db) => {
    const searchValue = elSearchInput.value.trim();
    const regex = new RegExp(searchValue, 'gi')

    const filtered = [];
    db.forEach((film) => {
        if (film.title.match(regex)) {
            filtered.push(film);
        }
    })

    return filtered;
}

const sortedByGenre = (db) => {
    const selectValue = searchSelect.value;
    const filtered = [];

    db.forEach((elem) => {
        elem.genres.forEach((e) => {
            if (e == selectValue) {
                filtered.push(elem);
            }
        })
    })

    return filtered;
}

const searchFilms = (arr1, arr2) => {  //arr1 = byTitle | arr2 = by Genre
    const selectValue = searchSelect.value;
    const filtered = [];

    if (selectValue == 'All') {
        arr1.forEach((elem) => {
            filtered.push(elem);
        })
    } else if (selectValue != 'All') {
        arr1.forEach((film) => {
            if (arr2.includes(film)) {
                filtered.push(film);
            }
        })

        arr2.forEach((film) => {
            if (arr1.includes(film)) {
                filtered.push(film);
            }
        })
    }

    return filtered.filter((value, index) => filtered.indexOf(value) === index); //removing duplicates
}

renderFilms(sortFilmsByTitle(films));
renderGenres(getAllGenres(films));

elAddForm.addEventListener('submit', handleAddSubmit);
elSearchForm.addEventListener('submit', handleFindSubmit);
elSortSelect.addEventListener('change', handleSortSubmit);