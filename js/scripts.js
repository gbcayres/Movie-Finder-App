const apiKey = "0b08b721368c8048e2cfe0d2ea146852";
const imgBaseUrl = `https://image.tmdb.org/t/p/w1280`;
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;

const $cardsContainer = document.querySelector(".cards-container");
const $input = document.querySelector(".search-input");
const $searchBtn = document.querySelector(".search-btn");
const $loadMoreBtn = document.querySelector(".loadMore-btn");
const urlSearch = new URLSearchParams(window.location.search);

const $img = document.querySelector(".img");
const $title = document.querySelector(".title");
const $rate = document.querySelector(".rate");
const $genres = document.querySelector(".genres");
const $releaseDate = document.querySelector(".release-date");
const $overview = document.querySelector(".overview");
const $cast = document.querySelector(".cast-container");

const movieId = urlSearch.get("id");
console.log(movieId);

let currentPage = 1;

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log("Something went wrong: " + error);
    return [];
  }
}

async function displayCards(data) {
  if (data.length === 0) {
    $cardsContainer.innerHTML += '<p class="msg">No more results found.</p>';
  }

  let newContent = data.map((movieData) => {
    return createCard(movieData);
  })

  $cardsContainer.innerHTML += newContent.join('');
}

async function fetchDataAndDisplayCards(url) {
  const data = await fetchData(url);
  displayCards(data.results);
}


function createCard(data) {
  const title = data.title;
  const releaseDate = data.release_date;
  const overview = data.overview || "No overview yet...";
  const posterPath = data.poster_path;
  const imgPath = posterPath ? imgBaseUrl + posterPath : "assets/images/no-image.png";
  const formattedTitle = title.length > 15 ? title.slice(0, 15) + "..." : title;
  const formattedDate = releaseDate || "No release date yet...";
  const link = `movie.html?id=${data.id}`;
  const card = `
    <td class="card-wrapper">
      <div class="card">
        <img width="100%" src="${imgPath}" alt="poster-image">
        <div class="card__content">
          <div class="card-info">
            <div>
              <h3 class="card-title">${formattedTitle}</h3>
              <span class="card-release">${formattedDate} </span>
            </div>
            <a href="${link}" target="_blank" class="card-link">See more</a>
          </div>
          <p class="card-overview">${overview}</p>
        </div>
      </div>
    </td>`;
  return card;
}

function clearResults() {
  $cardsContainer.innerHTML = "";
}

async function loadMore() {
  currentPage++;
  const query = $input.value;
  const newUrl = query ? `${searchUrl}${query}&page=${currentPage}` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${currentPage}`;
  await fetchDataAndDisplayCards(newUrl);
}

async function initialize() {
  clearResults();
  const newUrl = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${currentPage}`;
  await fetchDataAndDisplayCards(newUrl);
}

async function searchMovies() {
  currentPage = 1;
  const query = $input.value;
  if (query) {
    clearResults();
    const newUrl = `${searchUrl}${query}&page=${currentPage}`;
    await fetchDataAndDisplayCards(newUrl);
  }
}

async function getMovie() {
  const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
  const movieData = await fetchData(movieUrl);
  const castData = await getCast();
  displayMovie(movieData, castData);
  const actors = await getActors(castData);
  $cast.innerHTML += actors;
}

function getActors(data) {
  let actors = data.map((actor) => {
    const name = actor.name;
    const profilePath = actor.profile_path;
    const imgPath = profilePath ? imgBaseUrl + profilePath : "assets/images/no-image.png";
    const card = `
      <div class="actor-card">
        <img src="${imgPath}" alt="actor pic" class="actor-pic">
        <p class="actor-name">${name}</p>
      </div>`

    return card;
  })  

  return actors.slice(0, 15).join('');
}

async function getCast() {
  const castUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;
  const creditsData = await fetchData(castUrl);
  const castData = creditsData.cast;
  return castData;
}


function displayMovie(data) {
  const title = data.title;
  const releaseDate = data.release_date;
  const formattedRate = data.vote_average.toFixed(1);
  const imgPath = data.poster_path ? imgBaseUrl + data.poster_path : "assets/images/no-image.png";
  const genres = getGenres(data.genres);
  const overview = data.overview;
  $img.setAttribute("src", imgPath);
  $title.textContent = title;
  $releaseDate.textContent = releaseDate;
  $rate.innerHTML += formattedRate;
  $genres.innerHTML = genres;
  $overview.textContent = overview;
}

function getGenres(data) {
  let genres = data.map((genre) => {
    return `<span>${genre.name}</span>`
  })

  return genres.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (movieId) {
    getMovie();
  } else {
    initialize();
    $searchBtn.addEventListener('click', searchMovies);
    $loadMoreBtn.addEventListener('click', loadMore);
  }
});