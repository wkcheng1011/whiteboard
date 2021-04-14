self.addEventListener("install", function (event) {
  console.log("install");
	self.skipWaiting();
});
self.addEventListener("fetch", function (event) {
  console.log("fetch");
	event.respondWith(
		fetch(event.request)
	);
});
self.addEventListener("refreshOffline", function (response) {
  console.log("refreshOffline");
});
self.addEventListener("push", function (event) {
  console.log("push");
	var data = event.data.json();
	var opts = {
		body: data.body,
		icon: data.icon,
		data: {
			url: data.url,
		},
	};
	event.waitUntil(self.registration.showNotification(data.title, opts));
});
self.addEventListener("notificationclick", function (event) {
	var data = event.notification.data;
	event.notification.close();
	event.waitUntil(clients.openWindow(data.url));
});
