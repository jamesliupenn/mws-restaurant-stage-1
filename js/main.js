/* eslint-disable */
let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Register the service worker
 */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then((registration) => {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch((error) => {
      console.log('Service worker registration failed, error:', error);
    });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
  // fetchAllRestaurants();
});

// fetchAllRestaurants = () => {
//   DBHelper.fetchAllRestaurants();
// }

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: '<map_api_token>',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const div = document.createElement('div');
  div.className = 'img-container';

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('alt', 'An image of restaurant: ' + restaurant.name);
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '-400.jpg';
  image.setAttribute('srcset', 
    DBHelper.imageUrlForRestaurant(restaurant) + '-400.jpg' + ' 400w, ' +
    DBHelper.imageUrlForRestaurant(restaurant) + '-800.jpg' + ' 800w'
    );
  div.append(image);

  // Create the Favorite Element
  const favorite = document.createElement('div');
  favorite.className = 'favorite-icon';
  // Checks the flag 'is_favorite' from the API
  const isFavorite = (restaurant['is_favorite']) ? true : false;
  // Create the Like button and style it with the image
  const likeButton = document.createElement('button');
  likeButton.style.background = isFavorite ? 
    `url('../img/002-favorite-1.svg') no-repeat` : 
    `url('../img/001-favorite.svg') no-repeat`;

  likeButton.innerHTML = isFavorite ? 
    restaurant.name + 'is a favorite' : 
    restaurant.name + 'is not a favorite';

  likeButton.id = 'favorite-icon-' + restaurant.id;

  // Adding the Like Button event listener, the button click triggers
  // clickOnFavorite fxn
  likeButton.onclick = ((event) => {
    // console.log(restaurant.id, isFavorite);
    clickOnFavorite(restaurant.id, !isFavorite);
  });

  favorite.append(likeButton);
  div.append(favorite);

  li.append(div);

  const name = document.createElement('h2');
  name.setAttribute('class', 'restaurant-name');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

  // Set tabindex to -1 for all the map markers
  const markers = document.getElementsByClassName('leaflet-marker-icon');
  for (let i = 0; i < markers.length; i++) {
    markers[i].setAttribute('tabindex', '-1');
  }
  // Set tabindex to -1 for zoom controls
  const zoomin = document.getElementsByClassName('leaflet-control-zoom-in');
  zoomin[0].setAttribute('tabindex', '-1');
  const zoomout = document.getElementsByClassName('leaflet-control-zoom-out');
  zoomout[0].setAttribute('tabindex', '-1');
} 

/**
 * Sending requests upon button click on the favorite button
 */
clickOnFavorite = (id, state) => {
  // Change the button state and modify the DOM
  const likeButton = document.getElementById("favorite-icon-" + id);
  likeButton.style.background = state ? 
    `url('../img/002-favorite-1.svg') no-repeat` : 
    `url('../img/001-favorite.svg') no-repeat`;

  likeButton.onclick = ((event) => {
    clickOnFavorite(id, !state);
  });

  // Update the Restaurant API
  Api.updateIsFavorite(id, state);

  // Update the IDB
  DBHelper.markAsFavorite(id);
}