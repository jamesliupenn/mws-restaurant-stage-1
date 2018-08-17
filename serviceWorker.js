// Service Worker for offline-first approach

const urlsToCache = [
	'./', 
	'./css/styles.css',
	'./index.html',
	'./restaurant.html',
	'./js/main.js',
	'./js/restaurant_info.js',
	'./js/dbhelper.js',
	'./data/restaurants.json',
	'./img/1.jpg',
	'./img/2.jpg',
	'./img/3.jpg',
	'./img/4.jpg',
	'./img/5.jpg',
	'./img/6.jpg',
	'./img/7.jpg',
	'./img/8.jpg',
	'./img/9.jpg',
	'./img/10.jpg'
];

const cacheName = 'restaurant-cache-v1';


// Listen for install event
self.addEventListener('install', function(event) {
    // Open a cache and add all the specified files 
    event.waitUntil(
    	caches.open(cacheName).then(function(cache) {
    		return cache.addAll(urlsToCache);
    	})
    );
});

self.addEventListener('activate', function(event) {
  // Perform some task
  console.log('activating');
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response)
				return response;
			return fetch(event.request);
		})
	);
});