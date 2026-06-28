const Searchbtn = document.getElementById("searchBtn");

async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  const data = await response.json();
  if (data.length > 0) {
    return {
      display_name: data[0].display_name,
      latitude: data[0].lat,
      longitude: data[0].lon,
    };
  }
  throw new Error("Location not found");
}

// Helper to match Open-Meteo codes to modern Bootstrap classes
function getWeatherIconClass(code) {
  if (code === 0) return "bi-sun-fill text-warning";
  if (code >= 1 && code <= 3) return "bi-cloud-sun-fill text-secondary";
  if (code === 45 || code === 48) return "bi-cloud-fog2-fill text-muted";
  if (code >= 51 && code <= 57) return "bi-cloud-drizzle-fill text-info";
  if (code >= 61 && code <= 67) return "bi-cloud-rain-heavy-fill text-primary";
  if (code >= 71 && code <= 77) return "bi-cloud-snow-fill text-info";
  if (code >= 80 && code <= 82) return "bi-cloud-rain-fill text-primary";
  if (code >= 85 && code <= 86) return "bi-cloud-snow-fill text-info";
  if (code >= 95 && code <= 99) return "bi-cloud-lightning-rain-fill text-dark";
  return "bi-cloud-fill text-secondary";
}

Searchbtn.addEventListener("click", async () => {
  const PlaceName = document.getElementById("city").value.trim();
  const weatherCard = document.getElementById("weatherCard");
  const ErrorCard = document.getElementById("error");

  if (!PlaceName) return;

  ErrorCard.classList.add("d-none");
  weatherCard.classList.add("d-none");

  try {
    const cor = await getCoordinates(PlaceName);
    
    // Added apparent_temperature to gather "Feels Like" metrics accurately
    const WeatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${cor.latitude}&longitude=${cor.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`;
    
    const weatherCardCityName = document.getElementById("cityName");
    const weatherCardTemp = document.getElementById("temp");
    const weatherCardDescription = document.getElementById("description");
    const weatherCardHumidity = document.getElementById("humidity");
    const weatherCardFeelsLike = document.getElementById("feelsLike");
    const weatherCardWind = document.getElementById("wind");
    const weatherIconContainer = document.getElementById("weatherIconContainer");

    const weatherResponse = await fetch(WeatherAPI);
    const weatherData = await weatherResponse.json();

    const weatherDescription = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snowfall",
      73: "Moderate snowfall",
      75: "Heavy snowfall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    const current = weatherData.current;
    const current_units = weatherData.current_units;

    // Show result card
    weatherCard.classList.remove("d-none");

    // Map content correctly to elements
    weatherCardCityName.innerText = cor.display_name;
    weatherCardTemp.innerText = `${current.temperature_2m}${current_units.temperature_2m}`;
    weatherCardDescription.innerText = weatherDescription[current.weather_code] || "Unknown Conditions";
    
    weatherCardHumidity.innerText = `${current.relative_humidity_2m}${current_units.relative_humidity_2m}`;
    weatherCardWind.innerText = `${current.wind_speed_10m} ${current_units.wind_speed_10m}`;
    weatherCardFeelsLike.innerText = `${current.apparent_temperature}${current_units.apparent_temperature}`;

    // Render corresponding icon dynamically
    const iconClass = getWeatherIconClass(current.weather_code);
    weatherIconContainer.innerHTML = `<i class="bi ${iconClass}" style="font-size: 80px;"></i>`;

  } catch (error) {
    console.error(error);
    ErrorCard.classList.remove("d-none");
    weatherCard.classList.add("d-none");
  }
});