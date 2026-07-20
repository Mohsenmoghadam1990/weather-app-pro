// ==========================================
// Weather App Pro
// ==========================================

// API Key
const apiKey = "91cd50f6af6a1a3c1d799a7d4936e5ea";

// ==========================================
// Elements
// ==========================================

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const loader = document.getElementById("loader");

const cityName = document.getElementById("cityName");
const country = document.getElementById("country");
const temp = document.getElementById("temp");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const updated = document.getElementById("updated");

const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const liveClock = document.getElementById("liveClock");

const forecastCards = document.getElementById("forecastCards");

const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteCities = document.getElementById("favoriteCities");

const weatherAlert = document.getElementById("weatherAlert");
const weatherEffect = document.getElementById("weatherEffect");

// ==========================================
// Search
// ==========================================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        alert("Please enter a city name.");
        return;

    }

    getWeather(city);

});

// ==========================================
// Enter Key
// ==========================================

cityInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});

// ==========================================
// Get Weather
// ==========================================

async function getWeather(city) {

    try {

        loader.classList.remove("hidden");

        const response = await fetch(

            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

        );

        const data = await response.json();

        if (data.cod != 200) {

            loader.classList.add("hidden");

            alert("City not found");

            return;

        }

        showWeather(data);

        await getForecast(
            data.coord.lat,
            data.coord.lon
        );

        localStorage.setItem(
            "lastCity",
            city
        );

        loader.classList.add("hidden");

    }

    catch (error) {

        loader.classList.add("hidden");

        console.error(error);

        alert("Connection Error");

    }

}

// ==========================================
// Show Weather
function showWeather(data) {

    cityName.textContent = data.name;
    country.textContent = data.sys.country;

    temp.textContent =
        Math.round(data.main.temp) + "°C";

    description.textContent =
        data.weather[0].description;

    humidity.textContent =
        data.main.humidity + "%";

    wind.textContent =
        data.wind.speed + " m/s";

    feelsLike.textContent =
        Math.round(data.main.feels_like) + "°C";

    updated.textContent =
        "Updated: " + new Date().toLocaleTimeString();

    // Extra Weather Info

    pressure.textContent =
        data.main.pressure + " hPa";

    visibility.textContent =
        (data.visibility / 1000).toFixed(1) + " km";

    // Sunrise & Sunset

    const timezone = data.timezone;

    sunrise.textContent =
        new Date((data.sys.sunrise + timezone) * 1000)
        .toLocaleTimeString("en-US", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit"
        });

    sunset.textContent =
        new Date((data.sys.sunset + timezone) * 1000)
        .toLocaleTimeString("en-US", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit"
        });

    // Weather Icon

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    // Background

    changeBackground(data.weather[0].main);

    // Animation

    createWeatherEffect(data.weather[0].main);

    // Alert

    checkWeatherAlert(data);

}
// ==========================================
// Forecast
// ==========================================

async function getForecast(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        forecastCards.innerHTML = "";

        const dailyForecast =
            data.list.filter((item, index) => index % 8 === 0);

        dailyForecast.slice(0, 5).forEach(item => {

            const card = document.createElement("div");

            card.className = "forecast-card";

            const date = new Date(item.dt * 1000);

            card.innerHTML = `
                <p>${date.toLocaleDateString()}</p>

                <img
                    src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                    alt="${item.weather[0].description}"
                >

                <h3>${Math.round(item.main.temp)}°C</h3>

                <p>${item.weather[0].main}</p>
            `;

            forecastCards.appendChild(card);

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================
// My Location
// ==========================================

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");
        return;

    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            getWeatherByLocation(
                position.coords.latitude,
                position.coords.longitude
            );

        },

        () => {

            alert("Location permission denied.");

        }

    );

});

// ==========================================
// Get Weather By Location
// ==========================================

async function getWeatherByLocation(lat, lon) {

    try {

        loader.classList.remove("hidden");

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        showWeather(data);

        cityInput.value = data.name;

        await getForecast(lat, lon);

        loader.classList.add("hidden");

    }

    catch (error) {

        loader.classList.add("hidden");

        console.error(error);

        alert("Failed to get weather for your location.");

    }

}

// ==========================================
// Change Background
// ==========================================

function changeBackground(weather) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy"
    );

    switch (weather) {

        case "Clear":
            document.body.classList.add("sunny");
            break;

        case "Clouds":
            document.body.classList.add("cloudy");
            break;

        case "Rain":
        case "Drizzle":
        case "Thunderstorm":
            document.body.classList.add("rainy");
            break;

        case "Snow":
            document.body.classList.add("snowy");
            break;

    }

}// ==========================================
// Weather Effects
// ==========================================

function createWeatherEffect(type) {

    weatherEffect.innerHTML = "";

    // Rain

    if (type === "Rain" || type === "Drizzle") {

        for (let i = 0; i < 80; i++) {

            const drop = document.createElement("div");

            drop.className = "raindrop";

            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDelay = Math.random() + "s";

            weatherEffect.appendChild(drop);

        }

    }

    // Snow

    else if (type === "Snow") {

        for (let i = 0; i < 50; i++) {

            const snow = document.createElement("div");

            snow.className = "snowflake";

            snow.textContent = "❄";

            snow.style.left = Math.random() * 100 + "%";
            snow.style.animationDelay = Math.random() * 5 + "s";

            weatherEffect.appendChild(snow);

        }

    }

    // Clouds

    else if (type === "Clouds") {

        for (let i = 0; i < 6; i++) {

            const cloud = document.createElement("div");

            cloud.className = "cloud";

            cloud.textContent = "☁️";

            cloud.style.left = Math.random() * 80 + "%";
            cloud.style.top = Math.random() * 40 + "%";
            cloud.style.animationDelay = Math.random() * 5 + "s";

            weatherEffect.appendChild(cloud);

        }

    }

}

// ==========================================
// Weather Alerts
// ==========================================

function checkWeatherAlert(data) {

    weatherAlert.className = "weather-alert";

    if (data.main.feels_like >= 35) {

        weatherAlert.textContent =
            "🔥 High Temperature Warning";

        weatherAlert.classList.add("danger");

    }

    else if (data.main.temp <= 0) {

        weatherAlert.textContent =
            "❄️ Freezing Temperature Warning";

        weatherAlert.classList.add("danger");

    }

    else if (data.wind.speed >= 10) {

        weatherAlert.textContent =
            "💨 Strong Wind Warning";

        weatherAlert.classList.add("warning");

    }

    else if (
        data.weather[0].main === "Rain" ||
        data.weather[0].main === "Thunderstorm"
    ) {

        weatherAlert.textContent =
            "🌧 Rain Expected";

        weatherAlert.classList.add("warning");

    }

    else {

        weatherAlert.textContent =
            "✅ No Weather Alerts";

    }

}
// ==========================================
// Favorite Cities
// ==========================================

favoriteBtn.addEventListener("click", addFavorite);

function addFavorite() {

    const city = cityName.textContent;

    if (!city || city === "City") return;

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(city)) {

        favorites.push(city);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

    }

    loadFavorites();

}

function loadFavorites() {

    favoriteCities.innerHTML = "";

    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(city => {

        const btn = document.createElement("button");

        btn.className = "favorite-city";

        btn.textContent = city;

        btn.onclick = () => {

            cityInput.value = city;

            getWeather(city);

        };

        favoriteCities.appendChild(btn);

    });

}

// ==========================================
// Theme Button
// ==========================================

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    themeBtn.textContent =
        isDark ? "☀️" : "🌙";

    localStorage.setItem(
        "darkMode",
        isDark
    );

});

// ==========================================
// Live Clock
// ==========================================

function updateClock() {

    const now = new Date();

    liveClock.textContent =
        now.toLocaleTimeString();

}

setInterval(updateClock, 1000);

updateClock();

// ==========================================
// Load Saved Settings
// ==========================================

window.addEventListener("load", () => {

    const darkMode =
        localStorage.getItem("darkMode");

    if (darkMode === "true") {

        document.body.classList.add("dark");

        themeBtn.textContent = "☀️";

    }

    loadFavorites();

    const lastCity =
        localStorage.getItem("lastCity");

    if (lastCity) {

        cityInput.value = lastCity;

        getWeather(lastCity);

    } else {

        getWeather("London");

    }

    cityInput.focus();

});

// ==========================================
// Service Worker
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {

                console.log(
                    "Service Worker Registered"
                );

            })
            .catch(console.error);

    });

}

// ==========================================
// End
// ==========================================
// ==========================================