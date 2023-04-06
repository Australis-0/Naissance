//Initialise map object
var map = L.map("map").setView({
  inertia: true,
  lon: 0,
  lat: 0,
  minZoom: 3,
  maxZoom: 10,
  worldCopyJump: true //Makes sure the world map wraps around
}).setView([51.505, -0.09], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
