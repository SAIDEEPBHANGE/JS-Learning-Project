// DOM Element Caches
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const cityInput = document.getElementById("city");
const weatherContent = document.getElementById("weatherContent");
const errorCard = document.getElementById("error");
const recentSearchesContainer = document.getElementById("recentSearches");
const unitToggleC = document.getElementById("unitC");
const unitToggleF = document.getElementById("unitF");
// State parameters
let currentSearchQuery = "";
let recentSearches = JSON.parse(localStorage.getItem("weather_history")) || [];
// WMO Weather Condition Descriptions Map
const weatherDescription = {
  0: {
    text: "Clear sky",
    icon: "bi-sun-fill text-warning",
    bg: "bg-warning-subtle",
  },
  1: {
    text: "Mainly clear",
    icon: "bi-cloud-sun-fill text-warning",
    bg: "bg-info-subtle",
  },
  2: {
    text: "Partly cloudy",
    icon: "bi-cloud-sun-fill text-secondary",
    bg: "bg-info-subtle",
  },
  3: {
    text: "Overcast",
    icon: "bi-cloud-fill text-secondary",
    bg: "bg-secondary-subtle",
  },
  45: {
    text: "Fog",
    icon: "bi-cloud-fog2-fill text-muted",
    bg: "bg-secondary-subtle",
  },
  48: {
    text: "Depositing rime fog",
    icon: "bi-cloud-fog2-fill text-muted",
    bg: "bg-secondary-subtle",
  },
  51: {
    text: "Light drizzle",
    icon: "bi-cloud-drizzle-fill text-info",
    bg: "bg-primary-subtle",
  },
  53: {
    text: "Moderate drizzle",
    icon: "bi-cloud-drizzle-fill text-info",
    bg: "bg-primary-subtle",
  },
  55: {
    text: "Dense drizzle",
    icon: "bi-cloud-drizzle-fill text-info",
    bg: "bg-primary-subtle",
  },
  61: {
    text: "Slight rain",
    icon: "bi-cloud-rain-fill text-primary",
    bg: "bg-primary-subtle",
  },
  63: {
    text: "Moderate rain",
    icon: "bi-cloud-rain-heavy-fill text-primary",
    bg: "bg-primary-subtle",
  },
  65: {
    text: "Heavy rain",
    icon: "bi-cloud-rain-heavy-fill text-primary",
    bg: "bg-primary-subtle",
  },
  71: {
    text: "Slight snowfall",
    icon: "bi-cloud-snow-fill text-info",
    bg: "bg-light",
  },
  73: {
    text: "Moderate snowfall",
    icon: "bi-cloud-snow-fill text-info",
    bg: "bg-light",
  },
  75: {
    text: "Heavy snowfall",
    icon: "bi-cloud-snow-fill text-info",
    bg: "bg-light",
  },
  80: {
    text: "Slight rain showers",
    icon: "bi-cloud-rain-fill text-primary",
    bg: "bg-primary-subtle",
  },
  95: {
    text: "Thunderstorm",
    icon: "bi-cloud-lightning-rain-fill text-dark",
    bg: "bg-secondary-subtle",
  },
};
// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderRecentSearches();
  // Listen for Unit Switching changes instantly
  unitToggleC.addEventListener("change", reFetchCurrent);
  unitToggleF.addEventListener("change", reFetchCurrent);
  // Enter key support inside search field
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });
});
async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      name:
        data[0].display_name.split(",")[0] +
        ", " +
        (data[0].display_name.split(",")[1] || ""),
      lat: data[0].lat,
      lon: data[0].lon,
    };
  }
  throw new Error("Location not found");
}
function updateBackground(weatherCode) {
  const lookup = weatherDescription[weatherCode] || { bg: "bg-light" };
  document.body.classList.remove(
    "bg-light",
    "bg-warning-subtle",
    "bg-info-subtle",
    "bg-secondary-subtle",
    "bg-primary-subtle",
  );
  document.body.classList.add(lookup.bg);
}
function addHistoryItem(name) {
  if (!recentSearches.includes(name)) {
    recentSearches.unshift(name);
    if (recentSearches.length > 5) recentSearches.pop(); // Cap history length at 5 items
    localStorage.setItem("weather_history", JSON.stringify(recentSearches));
    renderRecentSearches();
  }
}
function renderRecentSearches() {
  recentSearchesContainer.innerHTML = "";
  if (recentSearches.length === 0) {
    recentSearchesContainer.innerHTML = `<div class="text-center text-muted py-2 small">No recent items</div>`;
    return;
  }
  recentSearches.forEach((item) => {
    const btn = document.createElement("button");
    btn.className =
      "list-group-item list-group-item-action text-start text-truncate py-2";
    btn.innerHTML = `<i class="bi bi-clock-history me-2 text-muted"></i>${item}`;
    btn.addEventListener("click", () => {
      cityInput.value = item;
      fetchWeatherDashboard(item);
    });
    recentSearchesContainer.appendChild(btn);
  });
}
function reFetchCurrent() {
  if (currentSearchQuery) fetchWeatherDashboard(currentSearchQuery, false);
}
// Main handler triggering full weather lookup stack
async function fetchWeatherDashboard(placeName, updateHistory = true) {
  if (!placeName) return;
  errorCard.classList.add("d-none");
  try {
    const coord = await getCoordinates(placeName);
    currentSearchQuery = placeName;
    if (updateHistory) addHistoryItem(placeName);
    const isFahrenheit = unitToggleF.checked;
    const tempUnit = isFahrenheit ? "fahrenheit" : "celsius";
    const windUnit = isFahrenheit ? "mph" : "kmh";
    // Build unified target endpoints gathering standard and bonus elements
    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
    const airQualityAPI = `https://api.open-meteo.com/v1/air-quality?latitude=${coord.lat}&longitude=${coord.lon}&current=european_aqi`;
    // Concurrent parallel network fetches
    const [wRes, aqRes] = await Promise.all([
      fetch(weatherAPI),
      fetch(airQualityAPI),
    ]);
    const wData = await wRes.json();
    const aqData = await aqRes.json();
    displayWeatherData(coord.name, wData, aqData);
  } catch (err) {
    console.error(err);
    errorCard.classList.remove("d-none");
    weatherContent.classList.add("d-none");
  }
}
function displayWeatherData(displayName, weatherData, aqiData) {
  weatherContent.classList.remove("d-none");
  const current = weatherData.current;
  const units = weatherData.current_units;
  const daily = weatherData.daily;
  const lookup = weatherDescription[current.weather_code] || {
    text: "Unknown Conditions",
    icon: "bi-cloud-fill text-muted",
  };
  // Update Dynamic Background
  updateBackground(current.weather_code);
  // Set Main Hero Weather Card Elements
  document.getElementById("cityName").innerText = displayName;
  document.getElementById("temp").innerText =
    `${Math.round(current.temperature_2m)}${units.temperature_2m}`;
  document.getElementById("description").innerText = lookup.text;
  document.getElementById("weatherIconContainer").innerHTML =
    `<i class="bi ${lookup.icon} display-1"></i>`;
  // Standard Metric Displays
  document.getElementById("humidity").innerText =
    `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  document.getElementById("wind").innerText =
    `${current.wind_speed_10m} ${units.wind_speed_10m}`;
  document.getElementById("feelsLike").innerText =
    `${Math.round(current.apparent_temperature)}${units.temperature_2m}`;
  // Bonus Metrics Processing (UV, AQI, Solar Cycles)
  const todayUv = daily.uv_index_max[0];
  document.getElementById("uvIndex").innerText =
    `${todayUv} (${getUvLabel(todayUv)})`;
  const aqiValue = aqiData.current?.european_aqi || "N/A";
  document.getElementById("aqi").innerText =
    `${aqiValue} (${getAqiLabel(aqiValue)})`;
  // Strip timestamps to clean readable user localized hour strings
  const formatTime = (timeStr) => (timeStr ? timeStr.split("T")[1] : "--:--");
  document.getElementById("sunrise").innerText = formatTime(daily.sunrise[0]);
  document.getElementById("sunset").innerText = formatTime(daily.sunset[0]);
  // Construct 5-Day Grid Layout
  const container = document.getElementById("forecastContainer");
  container.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const rawDate = new Date(daily.time[i]);
    const dayName = rawDate.toLocaleDateString("en-US", { weekday: "short" });
    const dayLookup = weatherDescription[daily.weather_code[i]] || {
      icon: "bi-cloud-fill text-muted",
    };
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const forecastCol = document.createElement("div");
    forecastCol.className = "col";
    forecastCol.innerHTML = `
      <div class="p-2 border rounded-3 bg-white bg-opacity-50">
        <div class="fw-bold small text-muted mb-1">${dayName}</div>
        <i class="bi ${dayLookup.icon} fs-4 my-1 d-block"></i>
        <div class="small fw-semibold mt-1">${maxTemp}° / <span class="text-muted fw-normal">${minTemp}°</span></div>
      </div>
    `;
    container.appendChild(forecastCol);
  }
}
// Quantitative classification parsing helpers
function getUvLabel(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Mod";
  if (uv <= 7) return "High";
  return "Very High";
}
function getAqiLabel(aqi) {
  if (aqi <= 20) return "Excellent";
  if (aqi <= 40) return "Good";
  if (aqi <= 60) return "Fair";
  return "Poor";
}
// Action Event Attachments
searchBtn.addEventListener("click", () =>
  fetchWeatherDashboard(cityInput.value.trim()),
);
geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    geoBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Detecting...`;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        geoBtn.innerHTML = `<i class="bi bi-geo-alt-fill"></i> Detect My Location`;
        // Reverse Geocoding with coordinate endpoints
        const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
        try {
          const res = await fetch(reverseGeocodeUrl);
          const data = await res.json();
          const locationName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Current Location";
          cityInput.value = locationName;
          fetchWeatherDashboard(locationName);
        } catch {
          fetchWeatherDashboard(
            `${pos.coords.latitude},${pos.coords.longitude}`,
          );
        }
      },
      () => {
        geoBtn.innerHTML = `<i class="bi bi-geo-alt-fill"></i> Location Denied`;
      },
    );
  }
});
