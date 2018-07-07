// UI VARIABLES
const home = document.getElementById('homeLink'),
			myFavLink = document.getElementById('myFavLink'),
			searchForm = document.getElementById('searchForm'),
			selectMovie = document.getElementById('selectMovie');

// PAGE STATE
const PageState = function() {
	// Set inital PageState to homeState
  let currentState = new homeState(this);
	
	// Initialize homeState
  this.init = () => {
    this.change(new homeState);
  }
	
	// Change State Method
  this.change = (state) => {
    currentState = state;
  }
}

// HOME STATE
const homeState = function(page) {
	// Add Search Section to View
  document.querySelector('#content').innerHTML = `
    <div class="container">
			<div class="jumbotron">
				<h2 class="text-center mb-5">Search for a Movie</h2>
				<form id="searchForm" onSubmit="searchMovies(event)">
					<div class="form-row text-center">
						<div class="col-lg-11 col-md-10 col-sm-8 col-xs-6 input-group-lg">
							<input type="text" id="searchText" class="form-control" placeholder="Search Movies...">
						</div>
						<div class="col-md-1 col-sm">
							<button type="submit" class="btn btn-lg btn-primary">Search</button>
						</div>
					</div>
				</form>
			</div>
		</div>
		<div class="container">
			<div id="movies" class="row"></div>
		</div>
  `;
};

// INSTATIATE PAGESTATE
const page = new PageState();

// INIT THE FIRST STATE
page.init();

// MOVIE DETAILS STATE
const movieDetailsState = function (page) {
	// Call OMDBAPI for movie details
	getMovie()
		.then((response) => {
			// Add Movie Details to View
			let movie = response.data;
			document.querySelector('#content').innerHTML = `
				<div class="row">
					<div class="col-md-4 mb-3">
						<div class="card">
							<div class="card-body">
								<img src="${movie.Poster} alt="${movie.Title}" class="thumbnail" />
							</div>
						</div>
					</div>
					<div class="col-md-8">
						<div class="card">
							<div class="card-body">
								<h2>${movie.Title}</h2>
								<ul class="list-group">
									<li class="list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>
									<li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>
									<li class="list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>
									<li class="list-group-item"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
									<li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
									<li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
									<li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="container">
						<div class="card">
							<div class="card-body">
								<h3>Plot</h3>
								${movie.Plot}
								<hr>
								<a onClick="addToFavorites(event, '${movie}')" class="btn btn-primary float-right">Add To Favorites</a>
								<a onClick="page.change(new homeState)" class="btn btn-secondary home-link float-right mr-3">Back to Search</a>
							</div>
						</div>
					</div>
				</div>
			`;
		})
		.catch((err) => {
			console.log(err);
		});
}

// MY FAVORITES STATE
const myFavoritesState = function(page) {
	// Add My Favorites to View
	document.querySelector('#content').innerHTML = `
			<h2 class="text-center mb-5">My Favorites</h2>
			<div id="favs" class="row"></div>
	`;
	
	// Call Localhost for My Favorites
	getFavorites()
		.then((response) => {
			let movies = response.data;
			let favs = document.querySelector('#favs');
			// Check for favorites
			if(movies.length) {
				// Build card for each movie
				movies.forEach((movie) => {
					favs.innerHTML += `
						<div class="col-md-3">
							<div class="card border-dark text-center">
								<div class="card-body">
									<img src="${movie.moviePoster}" alt="${movie.name}" />
									<h5 class="movie-title">${movie.name}</h5>
									<a onclick="movieSelected(event, '${movie.oid}', '${movie.name}', '${movie.moviePoster}')"	 class="btn btn-primary" href="#">Movie Details</a>
								</div>
							</div>
						</div>
					`;
				});
			} else {
				// Show message if no favorites
				favs.innerHTML = `
					<div class="container mb-3">
					<p class="m-auto text-center">Looks like you haven't added any favorites yet!</p>
					</div>
					<button onClick="page.change(new homeState)" class="btn btn-secondary m-auto">Back to Search</button>
				`;
			}
			
		})
		.catch((error) => {console.log(error)})
};

// HOME LINK EVENT LISTENER
home.addEventListener('click', (e) => {
  e.preventDefault();
  page.change(new homeState);
})

// MY FAVORITES LINK EVENT LISTENER
myFavLink.addEventListener('click', (e) => {
  e.preventDefault();
  page.change(new myFavoritesState);
})

// HANDLE SEARCH MOVIES SUBMIT
function searchMovies(e) {
	e.preventDefault();
	let searchText = document.getElementById('searchText').value;
  getMovies(searchText);
}

// HANDLE GET MOVIES
function getMovies(searchText) {
	// Get Movies from OMDBAPI
	axios.get('https://www.omdbapi.com/?apikey=b961fcd8&s='+searchText)
		.then((response) => {
			let movies = response.data.Search;
			let movieSection = document.querySelector('#movies');
			// Clear Previous Results if Any
			movieSection.innerHTML = '';
			// Build Card for Each Movie
			movies.forEach((movie) => {
				movieSection.innerHTML += `
					<div class="col-md-3">
						<div class="card border-dark text-center">
							<div class="card-body">
								<img src="${movie.Poster}" alt="${movie.Title}" />
								<h5 class="movie-title">${movie.Title}</h5>
								<a onclick="movieSelected(event, '${movie.imdbID}', '${movie.Title}', '${movie.Poster}')"	 class="btn btn-primary" href="#">Movie Details</a>
							</div>
						</div>
					</div>
				`;
			});
		})
		.catch((err) => {
			console.log(err);
		});
}

// HANDLE MOVIE SELECTED
function movieSelected(event, id, title, poster) {
	event.preventDefault();
	// Add Movie ID, Title, and Poster to Session Storage
	sessionStorage.setItem('movieId', id);
	sessionStorage.setItem('movieTitle', title);
	sessionStorage.setItem('moviePoster', poster);
	// Init movie detail state
	page.change(new movieDetailsState)
}

// HANDLE GET MOVIE SELECTED DETAILS
function getMovie() {
	let movieId = sessionStorage.getItem('movieId');
	return axios.get('https://www.omdbapi.com/?apikey=b961fcd8&i='+movieId)
}

// HANDLE ADD TO FAVORITES
function addToFavorites(e) {
	e.preventDefault();
	let favMovie;
	// Create favMovie Object from Session Storage if Movie exists
	if(sessionStorage.getItem('movieId')) {
		let oid = sessionStorage.getItem('movieId');
		let name = sessionStorage.getItem('movieTitle');
		let moviePoster = sessionStorage.getItem('moviePoster');
		favMovie = {
			oid,
			name,
			moviePoster
		}
	}
	saveFavorite(favMovie)
}

// HANDLE SAVE TO FAVORITES
function saveFavorite(favMovie) {
	// Save movie to localhost server
	axios.post('/favorites', favMovie)
		.then((response) => {
			// Alert Success
			showAlert('Success! Movied added to My Favorites.', 'alert-success');
		})
		.catch((error) => {console.log(error)})
}

// HANDLE GET FAVORITES
function getFavorites() {
	return axios.get('/favorites')
}

// SHOW ALERT
function showAlert(msg, className) {
  // Create div
  const div = document.createElement('div');
  // Add Classes
  div.className = `alert ${className}`;
  // Add Text
  div.appendChild(document.createTextNode(msg));
  // Get Parent
  const container = document.querySelector('#mainContainer');
  // Get Content Div
	const content = document.querySelector('#content');
	// Scroll to Page Top
	window.scrollTo(0,0);
  //Insert Alert
  container.insertBefore(div, content);
  // Timeout after 3 seconds
  setTimeout(function() {
    document.querySelector('.alert').remove();
  }, 3000);
};
