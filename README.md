# Atmosio

Atmosio is a modern weather forecast web application that provides real-time weather information through a clean, dark-themed user interface. The app allows users to search for locations and view accurate, up-to-date weather data in a visually simple and readable dashboard.

## Features

- Real-time weather information
- City-based weather search
- Search the location by pointing on map
- Current temperature and weather conditions
- Air quality index (AQI)
- Humidity, pressure, and visibility
- Sunrise and sunset timings
- Multi-day weather forecast
- Responsive and modern UI design

## Tech Used

- HTML
- CSS
- JavaScript
- [OpenWeather API](https://openweathermap.org/api) (for live data)
- [Leaflet.js](https://leafletjs.com/) (for interactive maps)
- [CARTO Basemap](https://carto.com/) (for map tiles)

## Code Overview

- DOM(Document Object Model) manipulation using JavaScript
- Fetching data from an API using fetch()
- Working with JSON data
- Using latitude & longitude
- Handling user interactions (search, click, location)
- Conditional styling using CSS classes
- Basic routing using URL hash (#)

## Functions of each .js script 

- API = Fetched data from openweather api
- App = Performs all tasks like creation of UI elements, uses fetched data to write the UI, Works as the main source of flow
- MapHandler = This is responsible for all functions related to map creation and use
- Module = This is responsible for getting the current date, time, month.
- Route = This has functions like getCurrentLocation(), check for url, writes the url in the form of lat=...&lon=...

## Flow

![Atmosio Preview](Flow.png)

## Purpose

This project is built to improve frontend development skills, API integration, and UI/UX design while creating a practical real-world application.

## Preview

A clean, dark-themed dashboard inspired by modern weather apps, focused on clarity and usability.

## Future Improvements

- Daily weather related news
- AI assistant for weather assistance
- Better error handling for invalid searches

## Credits

- **Weather Data:** [OpenWeather API](https://openweathermap.org/api)
- **Map Rendering:** [Leaflet.js](https://leafletjs.com/)
- **Map Tiles:** [CARTO Basemap](https://carto.com/)

> Note: All data and map tiles are used in accordance with the respective providers' terms of service.

## Version

> Atmosio 1.0.1

## Author

Sanath K S
