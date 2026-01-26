"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";
import { initMap } from "./mapHandler.js";

/**
 * Add event listener on vatious elements
 * @param {NodeList} elements Element node array
 * @param {string} eventType Event Type e.g.: "click", "mouseover"
 * @param {function} callback Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

/**
 * Toggle search in mobile device
 *
 */

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const mapCard = document.querySelector(".map-card");

const toggleSearch = () => {
  searchView.classList.contains("hidden");

  searchView.classList.toggle("active");
};
addEventOnElements(searchTogglers, "click", toggleSearch);

//Hides the map on showing the search view

if (searchView && mapCard) {
  const observer = new MutationObserver(() => {
    mapCard.classList.toggle("hidden", searchView.classList.contains("active"));
  });

  observer.observe(searchView, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

let currentLat = null;
let currentLon = null;

//SEARCH INTEGRATION

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
  searchTimeout ?? clearTimeout(searchTimeout);
  // if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchResult.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geo(searchField.value), function (locations) {
        searchField.classList.remove("searching");
        searchResult.classList.add("active");
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list></ul>
        `;

        const items = [];

        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li"); //////
          searchItem.classList.add("view-item");

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
            <div>
              <p class="item-title">${name}</p>
              <p class="label-2 item-subtitle">${state || ""} ${country}</p>
            </div>

            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
          `;

          searchResult
            .querySelector("[data-search-list]")
            .appendChild(searchItem);

          items.push(searchItem.querySelector("[data-search-toggler]"));
        }

        addEventOnElements(items, "click", function () {
          toggleSearch();
          searchResult.classList.remove("active");
        });
      });
    }, searchTimeoutDuration);
  }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector(
  "[data-current-location-btn]",
);
const errorContent = document.querySelector("[data-error-content]");

/**
 * Render Weather data in HTML
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 */
export const updateWeather = function (lat, lon) {
  loading.style.display = "grid";
  mapCard.classList.add("hidden");
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  errorContent.style.display = "none";

  const currentWeatherSection = document.querySelector(
    "[data-current-weather]",
  );
  const highlightSection = document.querySelector("[data-highlights]");
  const hourlySection = document.querySelector("[data-hourly-forecast]");
  const forecastSection = document.querySelector("[data-5-day-forecast]");

  currentWeatherSection.innerHTML = ``;
  highlightSection.innerHTML = ``;
  hourlySection.innerHTML = ``;
  forecastSection.innerHTML = ``;

  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "");
  } else {
    currentLocationBtn.removeAttribute("disabled");
  }

  // CURRENT WEATHER SECTION

  fetchData(url.currentWeather(lat, lon), function (currentWeather) {
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = currentWeather;

    const [{ description, icon }] = weather;

    const card = document.createElement("div");
    card.classList.add("card", "card-lg", "current-weather-card");

    card.innerHTML = `
      <h2 class="title-2 card-title">Now</h2>

      <div class="wrapper">
        <p class="heading">${parseInt(temp)}&deg; <sup>c</sup></p>

        <img
          src="./assets/images/weather_icons/${icon}.png"
          width="64"
          height="64"
          alt="${description}"
          class="weather-icon"
        />
      </div>

      <p class="body-3">${description}</p>

      <ul class="meta-list">
        <li class="meta-item">
          <span class="m-icon">calendar_today</span>

          <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
        </li>

        <li class="meta-item">
          <span class="m-icon">location_on</span>

          <p class="title-3 meta-text" data-location></p>
        </li>
      </ul>
    
    `;

    fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
      card.querySelector("[data-location]").textContent = `${name}, ${country}`;
    });
    currentWeatherSection.appendChild(card);

    // TODAYS HIGHLIGHT

    fetchData(url.airPollution(lat, lon), function (airPollution) {
      const [
        {
          main: { aqi },
          components: { no2, o3, so2, pm2_5 },
        },
      ] = airPollution.list;

      const card = document.createElement("div");
      card.classList.add("card", "card-lg");

      const humidityStyle = function () {
        if (humidity > 80) {
          return "solid-red";
        } else {
          return "card-sm";
        }
      };

      const visibilityStyle = function () {
        if (visibility >= 10000) {
          return "solid-green";
        } else {
          return "card-sm";
        }
      };

      card.innerHTML = `
        <h2 class="title-2" id="highlights-label">Today Highlights</h2>

        <div class="highlight-list">
          <div class="card card-sm highlight-card one">
            <h3 class="title-3">Air Quality Index</h3>

            <div class="wrapper">
              <span class="m-icon">air</span>

              <ul class="card-list">
                <li class="card-item">
                  <div class="tooltip">
                    <span class="info-icon"><img src="./assets/images/info.png" width="15" height="15"></span>
                    <span class="tooltip-text">
                      PM<sub>2.5</sub> (Fine Particulate Matter):
                      <br>Particles smaller than 2.5 µm.
                      <br>Can penetrate lungs & bloodstream.
                      <br>&lt;12 µg/m³ → Good
                      <br>12–35.4 µg/m³ → Moderate
                      <br>35.5–55.4 µg/m³ → Unhealthy for sensitive groups
                      <br>&gt;55.4 µg/m³ → Unhealthy
                    </span>
                  </div>

                  <p class="title-1">${pm2_5.toPrecision(3)}</p>

                  <p class="label-1">PM<sub>2.5</sub></p>
                </li>

                <li class="card-item">


                  <div class="tooltip">
                    <span class="info-icon"><img src="./assets/images/info.png" width="15" height="15"></span>
                    <span class="tooltip-text">
                      SO<sub>2</sub> (Sulfur Dioxide):
                      <br>Produced by burning fossil fuels.
                      <br>Can irritate lungs and worsen asthma.
                      <br>&lt;35 ppb → Good
                      <br>35–75 ppb → Moderate
                      <br>&gt;75 ppb → Unhealthy
                    </span>
                  </div>

                  <p class="title-1">${so2.toPrecision(3)}</p>

                  <p class="label-1">SO<sub>2</sub></p>
                </li>

                <li class="card-item">

                  <div class="tooltip">
                    <span class="info-icon"><img src="./assets/images/info.png" width="15" height="15"></span>
                    <span class="tooltip-text">
                      NO<sub>2</sub> (Nitrogen Dioxide):
                      <br>From vehicles and power plants.
                      <br>Can irritate airways and reduce lung function.
                      <br>&lt;53 ppb → Good
                      <br>53–100 ppb → Moderate
                      <br>&gt;100 ppb → Unhealthy
                    </span>
                  </div>

                  <p class="title-1">${no2.toPrecision(3)}</p>

                  <p class="label-1">NO<sub>2</sub></p>
                </li>

                <li class="card-item">

                  <div class="tooltip">
                    <span class="info-icon"><img src="./assets/images/info.png" width="15" height="15"></span>
                    <span class="tooltip-text">
                      O<sub>3</sub> (Ozone):
                      <br>Ground-level ozone formed by sunlight + pollution.
                      <br>Can cause chest pain, coughing, and worsen asthma.
                      <br>&lt;54 ppb → Good
                      <br>55–70 ppb → Moderate
                      <br>&gt;70 ppb → Unhealthy
                    </span>
                  </div>

                  <p class="title-1">${o3}</p>

                  <p class="label-1">O<sub>3</sub></p>
                </li>
              </ul>
            </div>

            <div>
              <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">
                ${module.aqiText[aqi].level}
              </span>
            </div>
          </div>

          <div class="card card-sm highlight-card two glass-card">
            <h3 class="title-3">Sunrise & Sunset</h3>

            <div class="card-list">
              <!-- Card Item 1 -->
              <div class="card-item">
                <span class="m-icon">clear_day</span>

                <div>
                  <p class="label-1">Sunrise</p>

                  <p class="title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
                </div>
              </div>

              <!-- Card Item 2 -->
              <div class="card-item">
                <span class="m-icon">clear_night</span>

                <div>
                  <p class="label-1">Sunset</p>

                  <p class="title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- HUMIDITY -->
          <div class="card ${humidityStyle()} highlight-card">
            <h3 class="title-3">Humidity</h3>

            <div class="wrapper">
              <span class="m-icon">humidity_percentage</span>

              <p class="title-1">${humidity}<sup>%</sup></p>
            </div>
          </div>

          <!-- PRESSURE -->
          <div class="card card-sm highlight-card">
            <h3 class="title-3">Pressure</h3>

            <div class="wrapper">
              <span class="m-icon">airwave</span>

              <p class="title-1">${pressure}<sub>hPa</sub></p>
            </div>
          </div>

          <!-- VISIBILITY -->
          <div class="card ${visibilityStyle()} highlight-card">
            <h3 class="title-3">Visibility</h3>

            <div class="wrapper">
              <span class="m-icon">visibility</span>

              <p class="title-1">${visibility / 1000}<sup>km</sup></p>
            </div>
          </div>

          <!-- FEELS LIKE -->
          <div class="card solid-blue  highlight-card">
            <h3 class="title-3">Feels Like</h3>

            <div class="wrapper">
              <span class="m-icon">thermostat</span>

              <p class="title-1">${parseInt(feels_like)}&deg;<sup>C</sup></p>
            </div>
          </div>
        </div>
      `;

      highlightSection.appendChild(card);
    });

    // 24H FORECAST SECTION

    fetchData(url.forecast(lat, lon), function (forecast) {
      const {
        list: forecastList,
        city: { timezone },
      } = forecast;

      hourlySection.innerHTML = `
        <h2 class="title-2">Today at</h2>

        <div class="slider-container">
          <ul class="slider-list" data-temp></ul>
          <ul class="slider-list" data-wind></ul>
        </div>
      
      `;

      for (const [index, data] of forecastList.entries()) {
        if (index > 7) break;

        const {
          dt: dateTimeUnix,
          main: { temp },
          weather,
          wind: { deg: windDirection, speed: windSpeed },
        } = data;

        const [{ icon, description }] = weather;

        const tempLi = document.createElement("li");

        tempLi.classList.add("slider-item");

        tempLi.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img
              src="./assets/images/weather_icons/${icon}.png"
              width="48"
              height="48"
              loading="lazy"
              alt="${description}"
              class="weather-icon"
              title="${description}"
            />

            <p class="body-3">${parseInt(temp)}&deg;</p>
          </div>
        `;

        hourlySection.querySelector("[data-temp]").appendChild(tempLi);

        const windLi = document.createElement("li");

        windLi.classList.add("slider-item");

        windLi.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img
              src="./assets/images/weather_icons/direction.png"
              width="48"
              height="48"
              loading="lazy"
              alt="direction"
              class="weather-icon"
              title="${windDirection} degrees"
              style = "transform: rotate(${windDirection - 180}deg)"
            />

            <p class="body-3">${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
          </div>
        `;

        hourlySection.querySelector("[data-wind]").appendChild(windLi);
      }

      // 5DAY FORECAST SECTION

      forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Day Forecast</h2>

        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
      `;

      for (let i = 7, len = forecastList.length; i < len; i += 8) {
        const {
          main: { temp_max },
          weather,
          dt_txt,
        } = forecastList[i];

        const [{ icon, description }] = weather;
        const date = new Date(dt_txt);

        const li = document.createElement("li");
        li.classList.add("card-item");

        li.innerHTML = `
          <div class="icon-wrapper">
            <img
              src="./assets/images/weather_icons/${icon}.png"
              width="36"
              height="36"
              alt="${description}"
              class="weather-icon"
              title="${description}"
            />

            <div class="span">
              <p class="title-2">${parseInt(temp_max)}&deg;</p>
            </div>
          </div>

          <p class="label-1">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>

          <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
        `;

        forecastSection.querySelector("[data-forecast-list]").appendChild(li);
      }

      loading.style.display = "none";
      mapCard.classList.remove("hidden");
      container.style.overflowY = "overlay";
      container.classList.add("fade-in");

      currentLat = lat;
      currentLon = lon;
    });
  });
};

initMap();
// renderMap();

export const loadedCords = function (lat, lon) {
  renderMap(lat, lon);
};

export const error404 = function () {
  errorContent.style.display = "flex";
};
