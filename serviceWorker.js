// adapted from https://www.smashingmagazine.com/2016/08/a-beginners-guide-to-progressive-web-apps/
var cacheName = 'v1:static';
self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				'./index.html',
				'./vendor/jquery-3.3.1.slim.min.js',
				'./script.js'
			]).then(function() {
				self.skipWaiting();
			});
		})
	);
});
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});
