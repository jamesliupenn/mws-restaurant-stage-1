/* eslint-disable */
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
	'./imagemin-img/1-800.jpg',
	'./imagemin-img/2-800.jpg',
	'./imagemin-img/3-800.jpg',
	'./imagemin-img/4-800.jpg',
	'./imagemin-img/5-800.jpg',
	'./imagemin-img/6-800.jpg',
	'./imagemin-img/7-800.jpg',
	'./imagemin-img/8-800.jpg',
	'./imagemin-img/9-800.jpg',
	'./imagemin-img/10-800.jpg'
];

const cacheName = 'restaurant-cache-v1';


// Listen for install event
self.addEventListener('install', event => {
	// Kick out the current active worker and activate asap
	self.skipWaiting();
	// Open a cache and add all the specified files 
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys => Promise.all(
			keys.map(key => {
				if (!expectedCaches.includes(key)) {
					return caches.delete(key);
				}
			})
		)).then(() => {
			console.log('Ready to handle fetches');
		})
	);
});

// Fetch cache
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request, {ignoreSearch: true}).then(response => {
			return response || fetch(event.request);
		})
	);
});
