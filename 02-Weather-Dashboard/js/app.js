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
Searchbtn.addEventListener("click", async () => {
  const PlaceName = document.getElementById("city").value;
  const weatherCard = document.getElementById("weatherCard");
  const ErrorCard = document.getElementById("error");
  ErrorCard.classList.add("d-none");
  weatherCard.classList.add("d-none");
  try {
    const cor = await getCoordinates(PlaceName);
    const WeatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${cor.latitude}&longitude=${cor.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const weatherCardCityName = document.getElementById("cityName");
    const weatherCardTemp = document.getElementById("temp");
    const weatherCardHumidity = document.getElementById("humidity");
    const weatherCardFeelsLike = document.getElementById("feelsLike");
    const weatherCardWind = document.getElementById("wind");
    console.log(cor);
    console.log(WeatherAPI);
    // Fetch weather
    const weatherResponse = await fetch(WeatherAPI);
    const weatherData = await weatherResponse.json();
    console.log(weatherData);
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
    weatherCard.classList.remove("d-none");
    weatherCardCityName.innerText = cor.display_name;
    weatherCardTemp.innerText =
      current.temperature_2m + " " + current_units.temperature_2m;
    weatherCardHumidity.innerText =
      current.relative_humidity_2m + " " + current_units.relative_humidity_2m;
    weatherCardFeelsLike.innerText = weatherDescription[current.weather_code];
    weatherCardWind.innerText =
      current.wind_speed_10m + " " + current_units.wind_speed_10m;
  } catch (error) {
    ErrorCard.classList.remove("d-none");
    weatherCard.classList.add("d-none");
  }
});
