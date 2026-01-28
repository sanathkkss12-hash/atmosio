"use strict";

import { updateWeather } from "./app.js";

let map;
let previousMarker = null;

const locatorIcon = L.icon({
  iconUrl: "./assets/images/locator.png",
  iconSize: [32, 32],
});

L.icon.Default;

export function initMap() {
  map = L.map("map", {
    zoomControl: false,
    maxBounds: [
      [-85, -180],
      [85, 180],
    ],
    maxBoundsViscosity: 0.25,
    worldCopyJump: false,
  }).setView([12.9767936, 77.590082], 10);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19,
    noWrap: true,
  }).addTo(map);

  map.removeControl(map.attributionControl);

  changeLocatorIcon(12.9767936, 77.590082); // Banglore location

  map.on("click", onMapClick);
}

export function changeLocatorIcon(lat, lng) {
  // Remove previous marker if exists
  if (previousMarker) {
    map.removeLayer(previousMarker);
  }

  // Add new marker
  const marker = L.marker([lat, lng], { icon: locatorIcon }).addTo(map);

  // remove marker when clicked
  // marker.on("click", () => map.removeLayer(marker));

  // Save this marker as previous
  previousMarker = marker;

  map.flyTo([lat, lng], map.getZoom(), {
    animate: true,
    duration: 1.5, // seconds (increase for slower)
  });
}

function onMapClick(e) {
  const { lat, lng } = e.latlng;

  // window.location.hash = `#/weather?lat=${lat}&lon=${lng}`;

  // Update weather
  updateWeather(`lat=${lat}&lon=${lng}`);

  changeLocatorIcon(lat, lng);
}
