const cities = {
    toronto: { name: "Toronto", latitude: 43.65, longitude: -79.38 },
    vancouver: { name: "Vancouver", latitude: 49.28, longitude: -123.12 },
    calgary: { name: "Calgary", latitude: 51.05, longitude: -114.07 },
    quebec: { name: "Québec City", latitude: 46.81, longitude: -71.21 },
    mississauga: { name: "Mississauga", latitude: 43.59, longitude: -79.64 }
};

let selectedCity = "toronto";
let requestId = 0;

function getWeatherInfo(code, isDay) {
    if (code === 0) {
        return { description: "Clear sky", icon: isDay ? "☀️" : "🌙", color: "sunny" };
    }
    if (code === 1 || code === 2) {
        return { description: "Partly cloudy", icon: isDay ? "🌤️" : "☁️", color: "cloudy" };
    }
    if (code === 3) {
        return { description: "Cloudy", icon: "☁️", color: "cloudy" };
    }
    if (code === 45 || code === 48) {
        return { description: "Foggy", icon: "🌫️", color: "cloudy" };
    }
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { description: "Rainy", icon: "🌧️", color: "rainy" };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { description: "Snowy", icon: "❄️", color: "snowy" };
    }
    if ([95, 96, 99].includes(code)) {
        return { description: "Thunderstorm", icon: "⛈️", color: "rainy" };
    }
    return { description: "Current weather", icon: "🌥️", color: "cloudy" };
}

async function loadWeather() {
    const city = cities[selectedCity];
    const currentRequest = ++requestId;
    const refreshButton = document.getElementById("refresh");

    document.getElementById("location").textContent = city.name;
    document.getElementById("status").textContent = "Updating weather data...";
    refreshButton.disabled = true;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day&timezone=auto`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();
        if (!data.current) {
            throw new Error("Weather data is missing");
        }
        if (currentRequest !== requestId) return;

        const weather = data.current;
        const isDay = weather.is_day === 1;
        const info = getWeatherInfo(weather.weather_code, isDay);

        document.getElementById("temperature").textContent = Math.round(weather.temperature_2m);
        document.getElementById("condition").textContent = info.description + (isDay ? " · Daytime" : " · Nighttime");
        document.getElementById("weather-icon").textContent = info.icon;
        document.getElementById("feels").textContent = Math.round(weather.apparent_temperature) + "°C";
        document.getElementById("humidity").textContent = weather.relative_humidity_2m + "%";
        document.getElementById("updated").textContent = "Updated: " + weather.time.replace("T", " ") + " (local)";
        document.getElementById("status").textContent = "Live weather data loaded";

        if (isDay) {
            document.body.className = info.color;
        } else {
            document.body.className = info.color === "sunny" ? "night" : "night-" + info.color;
        }
    } catch (error) {
        if (currentRequest !== requestId) return;
        document.getElementById("status").textContent = "Could not load weather. Please try Refresh Data.";
        document.getElementById("updated").textContent = "Connection error";
        console.error(error);
    } finally {
        if (currentRequest === requestId) {
            refreshButton.disabled = false;
        }
    }
}

const cityButtons = document.querySelectorAll(".city");
cityButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        selectedCity = button.dataset.city;

        cityButtons.forEach(function(cityButton) {
            cityButton.classList.remove("active");
        });
        button.classList.add("active");
        loadWeather();
    });
});


document.getElementById("refresh").addEventListener("click", loadWeather);

loadWeather();
