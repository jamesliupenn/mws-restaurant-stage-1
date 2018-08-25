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
