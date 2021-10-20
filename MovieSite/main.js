const url = `https://www.omdbapi.com/?apikey=5ee7fb40`;

let searchInput, typeSelect;

const output = document.querySelector('.output');
const details = document.querySelector('.details');
const pagination = document.querySelector('.pagination');
const more = pagination.querySelector('.pagination__more');
const count = more.querySelector('.pagination__count');
const clearBtn = pagination.querySelector('.clear-btn');

///main page...........
fetchCall(showIndex, '', 'Dracula', 'movie');

///search movie.............
searchForm.addEventListener('submit', function (event) {
  event.preventDefault();

  searchInput = searchForm.elements.search.value;
  typeSelect = searchForm.elements.type.value;

  fetchCall(showAll, '', searchInput, typeSelect);

  details.innerHTML = '';
});

///details.........
output.addEventListener('click', (event) => {
  const title = event.target.getAttribute('alt');

  if (title !== null) {
    const searchTitle = '&t=' + title;
    fetchCall(showDetails, searchTitle);
  }
});

///favorite...............
const showFavorite = document.querySelector('.favorite__btn');
showFavorite.addEventListener('click', (event) => {
  output.innerHTML = '';
  details.innerHTML = '';

  more.style.display = 'none';
  clearBtn.style.display = 'block';

  pagination.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target === clearBtn) {
      localStorage.clear();
      output.innerHTML = '<div class="warning">Add some...</div>';
      more.style.display = 'none';
      clearBtn.style.display = 'none';
    }
  });

  arrFavorites = JSON.parse(localStorage.getItem('favorites'));

  if (arrFavorites && arrFavorites.length > 0) {
    output.innerHTML += `<div class="output__found">Favorite Movies</div>`;

    for (item of arrFavorites) {
      const searchTitle = '&t=' + item;
      fetchCall(showFavorites, searchTitle);
    }
  } else {
    output.innerHTML = '<div class="warning">Add Some...</div>';
    more.style.display = 'none';
    clearBtn.style.display = 'none';
  }
});

output.addEventListener('click', (event) => {
  addFavorite(event, 'item');
});

details.addEventListener('click', (event) => {
  addFavorite(event);
});

/// add movie to 'favorite' page...............
function addFavorite(event, type = 'details') {
  const favoriteItem = event.target;

  let title = '';
  if (type === 'item')
    title = favoriteItem.nextElementSibling.getAttribute('alt');
  else
    title =
      favoriteItem.parentNode.parentNode.previousElementSibling.getAttribute(
        'alt'
      );

  if (title !== null && title !== undefined) {
    ///is film exists in local storage.......
    if (localStorage.getItem('favorites')) {
      const favorites = JSON.parse(localStorage.getItem('favorites'));

      ///search movie in local storage..........
      const findElement = favorites.findIndex((item) => {
        if (item === title) return item;
      });

      ///add movie to local storage...........
      if (findElement === -1) {
        favorites.push(title);
      } else {
        favorites.splice(findElement, 1);
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
      favoriteItem.classList.toggle('item__favorite--full');
      favoriteItem.classList.toggle('item-details__favorite--full');
    } else {
      const arrFavorite = [title];
      localStorage.setItem('favorites', JSON.stringify(arrFavorite));
      favoriteItem.classList.toggle('item__favorite--full');
      favoriteItem.classList.toggle('item-details__favorite--full');
    }
  }
}

///API call............
async function fetchCall(
  callback,
  title = '',
  query = '',
  type = '',
  page = 1
) {
  let response = '';

  if (title !== '') {
    response = await fetch(url + title);
  } else {
    response = await fetch(
      url + '&s=' + query + '&type=' + type + '&page=' + page
    );
  }

  if (response.ok) {
    let json = await response.json();
    if (callback) callback(json);
  } else {
    output.innerHTML = '<div class="error">Something wrong with it....</div>';
  }
}

///search results..............
function renderHtml(item) {
  if (item.Poster === 'N/A') item.Poster = 'img/cover.jpg';

  let result = '';
  result += `<div class="output__item item">
<div class="item__favorite ${checkLocal(item.Title)}"></div>
 <img class="item__img" src="${item.Poster}" alt="${item.Title}">
<div class="item__heading">${item.Title} (${item.Year})</div>
 </div>`;
  return result;
}

///render movies.............
function showIndex(json) {
  let result = '';

  if (json.Search !== undefined) {
    const item = json.Search;

    for (let i = 0; i < 4; i++) {
      result += renderHtml(item[i]);
    }
  } else {
    result += '<div class="warning">Error</div>';
  }

  output.innerHTML = result;
}

///allmovies...........
function showAll(json) {
  let result = '';
  clearBtn.style.display = 'none';

  if (json.Search !== undefined) {
    result += `<div class="output__found">Found ${json.totalResults}movies</div>`;

    json.Search.map((item) => {
      result += renderHtml(item);
    });

    ///amount of movies.............
    let searchCount = json.totalResults - 10;

    if (searchCount >= 1) {
      more.style.display = 'block';
      count.innerHTML = `(${searchCount})`;
      more.classList.remove('disabled');
    } else {
      count.innerHTML = ``;
      more.classList.add('disabled');
    }

    let page = 2;
    more.addEventListener('click', () => {
      if (searchCount > 0) {
        fetchCall(nextPage, '', searchInput, typeSelect, page);
        if (searchCount >= 10) {
          searchCount -= 10;
          count.innerHTML = `(${searchCount})`;
          more.classList.remove('disabled');
        } else {
          count.innerHTML = '';
          more.classList.add('disabled');
        }

        page++;
      }
    });
  } else {
    result += '<div class="warning"> Nothing Found</div>';
    more.style.display = 'none';
  }

  output.innerHTML = result;
}

///details
function showDetails(json) {
  if (json.Poster === 'N/A') json.Poster = 'img/cover.jpg';

  const result = `<div class="details__item item-details">
  <img class="item-details__img" src="${json.Poster}" alt="${json.Title}">
  <div class="item-details__description">
      <h2 class="item-details__heading2 heading2">
          ${json.Title}
          <div class="item__favorite item-details__favorite ${checkLocal(
            json.Title
          )}"></div>
      </h2>
      <div class="item-details__meta">${
        json.Year
      }&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;${
    json.Runtime
  }&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;${json.Genre}</div>
   <div class="item-details__synopsis">${json.Plot}</div>
   <div class="item-details__starring">Starring: <span>${
     json.Actors
   }</span></div>
        </div>
    </button>`;

  details.innerHTML = result;

  ///scroll top................
  window.scrollTo({
    top: 230,
    behavior: 'smooth',
  });
}

/// Pagination..........
function nextPage(json) {
  let result = '';

  if (json.Search !== undefined) {
    json.Search.map((item) => {
      result += renderHtml(item);
    });
  }

  output.innerHTML += result;
}

///render 'Favorites'..............
function showFavorites(json) {
  let result = '';
  result += renderHtml(json);
  output.innerHTML += result;
}

function checkLocal(title) {
  const favorites = JSON.parse(localStorage.getItem('favorites'));

  if (favorites && favorites.includes(title)) {
    return 'item__favorite--full item-details__favorite--full';
  }

  return '';
}
