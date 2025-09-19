document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "eee1875c5695577d3f0646aea6fb65a6";
  const cityInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const weatherData = document.getElementById("weather-data");
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");

  // Default city on load
  getWeatherData("Chennai");

  // Event listeners
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  });

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) {
        getWeatherData(city);
      }
    }
  });

  async function getWeatherData(city) {
    showLoading();
    hideError();
    hideWeatherData();

    try {
      // Fetch current weather
      const currentWeatherResponse = await fetch(
        `https:api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );

      if (!currentWeatherResponse.ok) {
        throw new Error("City not found");
      }

      const currentWeatherData = await currentWeatherResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https:api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );

      if (!forecastResponse.ok) {
        throw new Error("Forecast data not available");
      }

      const forecastData = await forecastResponse.json();

      displayWeatherData(currentWeatherData, forecastData);
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading();
    }
  }

  function displayWeatherData(current, forecast) {
    // Update current weather
    document.querySelector(
      ".location"
    ).textContent = `${current.name}, ${current.sys.country}`;
    document.querySelector(".temp").textContent = `${Math.round(
      current.main.temp
    )}°C`;

    // Update date
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.querySelector(".date").textContent = now.toLocaleDateString(
      "en-US",
      options
    );

    // Update weather icon
    const icon = document.querySelector(".weather-icon");
    const weatherId = current.weather[0].id;

    if (weatherId >= 200 && weatherId < 300) {
      icon.className = "fas fa-bolt weather-icon";
    } else if (weatherId >= 300 && weatherId < 500) {
      icon.className = "fas fa-cloud-rain weather-icon";
    } else if (weatherId >= 500 && weatherId < 600) {
      icon.className = "fas fa-cloud-showers-heavy weather-icon";
    } else if (weatherId >= 600 && weatherId < 700) {
      icon.className = "fas fa-snowflake weather-icon";
    } else if (weatherId >= 700 && weatherId < 800) {
      icon.className = "fas fa-smog weather-icon";
    } else if (weatherId === 800) {
      icon.className = "fas fa-sun weather-icon";
    } else {
      icon.className = "fas fa-cloud weather-icon";
    }

    // Update forecast
    const forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = "";

    // Get unique days (API returns data every 3 hours, we need one per day)
    const dailyForecasts = [];
    const seenDays = new Set();

    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!seenDays.has(day) && dailyForecasts.length < 5) {
        seenDays.add(day);
        dailyForecasts.push({
          day: day,
          temp: Math.round(item.main.temp),
          icon: item.weather[0].id,
          description: item.weather[0].description,
        });
      }
    }

    // Create forecast elements
    dailyForecasts.forEach((day) => {
      const forecastEl = document.createElement("div");
      forecastEl.className = "forecast-day";

      let iconClass = "fas fa-cloud";
      if (day.icon >= 200 && day.icon < 300) {
        iconClass = "fas fa-bolt";
      } else if (day.icon >= 300 && day.icon < 500) {
        iconClass = "fas fa-cloud-rain";
      } else if (day.icon >= 500 && day.icon < 600) {
        iconClass = "fas fa-cloud-showers-heavy";
      } else if (day.icon >= 600 && day.icon < 700) {
        iconClass = "fas fa-snowflake";
      } else if (day.icon >= 700 && day.icon < 800) {
        iconClass = "fas fa-smog";
      } else if (day.icon === 800) {
        iconClass = "fas fa-sun";
      }

      forecastEl.innerHTML = `
                      <div class="forecast-date">${day.day}</div>
                      <i class="${iconClass} weather-icon"></i>
                      <div class="forecast-temp">${day.temp}°C</div>
                      <div class="forecast-desc">${day.description}</div>
                  `;

      forecastContainer.appendChild(forecastEl);
    });

    showWeatherData();
  }

  function showLoading() {
    loading.classList.remove("hidden");
  }

  function hideLoading() {
    loading.classList.add("hidden");
  }

  function showError(message) {
    error.querySelector("p").textContent = message;
    error.classList.remove("hidden");
  }

  function hideError() {
    error.classList.add("hidden");
  }

  function showWeatherData() {
    weatherData.classList.remove("hidden");
  }

  function hideWeatherData() {
    weatherData.classList.add("hidden");
  }
});
