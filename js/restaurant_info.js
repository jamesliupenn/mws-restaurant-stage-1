/* eslint-disable */
let restaurant;
var newMap;

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
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: '<map_token>',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);

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
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favorite = document.getElementById('favorite-icon');
  // Checks the flag 'is_favorite' from the API
  const isFavorite = (restaurant['is_favorite']) ? true : false;
  // Create the Like button and style it with the image
  const likeButton = document.createElement('button');
  likeButton.style.background = isFavorite ? 
    `url('../img/002-favorite-1.svg') no-repeat` : 
    `url('../img/001-favorite.svg') no-repeat`;

  likeButton.innerHTML = '+';
  likeButton.id = 'favorite-icon-' + restaurant.id;
  likeButton.addEventListener('click', (event) => {
    DBHelper.markAsFavorite(restaurant.id);
  });
  favorite.append(likeButton);


  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.setAttribute('alt', restaurant.name);
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '-400.jpg';
  image.setAttribute('srcset', 
    DBHelper.imageUrlForRestaurant(restaurant) + '-400.jpg' + ' 400w, ' +
    DBHelper.imageUrlForRestaurant(restaurant) + '-800.jpg' + ' 800w'
    );
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    // Create spans within the td element
    const longName = document.createElement('span');
    const shortName = document.createElement('span');
    // Set the id for the added spans
    longName.setAttribute('id', 'longName');
    shortName.setAttribute('id', 'shortName');
    // Assign the HTML values
    longName.innerHTML = key;
    shortName.innerHTML = key.slice(0,3); // Abbreviation
    // Append into the structure  
    row.appendChild(day);
    day.appendChild(longName);
    day.appendChild(shortName);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 * Need to change this to fetching it from the API
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.setAttribute('id', 'reviews-title');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  // Set the ID attribute for the name
  name.setAttribute('id', 'reviewer-name');
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  // Set the ID attribute for the date
  date.setAttribute('id', 'reviewer-date');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  // Set the ID attribute for the rating
  rating.setAttribute('id', 'reviewer-rating');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  // Set the ID attribute for the comments
  comments.setAttribute('id', 'reviewer-comments');
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

setFavorite = (id, state) => {
}
