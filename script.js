// ==========================
// Travel Explorer Project JS
// ==========================

// ✅ Replace with your keys
const UNSPLASH_ACCESS_KEY = "-TrjPJEUDHX8cBixOrTqs8W6aPi8JHv_TiAGF7GHaHg";
const WEATHER_API_KEY = "3faaef08b478ab8fab90b9e218b74b31"; // 👈 Replace this
const MAPS_API_KEY = "AIzaSyAjpXhyyTDYZJ_vJHRKrjRV-T9ig-Bys5A";       // 👈 Replace this

// Elements
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const photoContainer = document.getElementById("photoContainer");
const weatherContainer = document.getElementById("weatherContainer");
const infoContainer = document.getElementById("infoContainer");
const mapContainer = document.getElementById("mapContainer");
const tripPlanner = document.getElementById("tripPlanner");

// Fetch Wikipedia Info
async function fetchInfo(city) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.extract ? data.extract : "No information available.";
  } catch (error) {
    console.error("Error fetching info:", error);
    return "No information available.";
  }
}

// Fetch Unsplash Photos
async function fetchPhotos(query) {
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

// Fetch Weather
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);
  return await response.json();
}

// Display Info
function displayInfo(info, city) {
  infoContainer.innerHTML = `
    <h2>About ${city}</h2>
    <p>${info}</p>
  `;
}

// Display Photos
function displayPhotos(photos, city) {
  photoContainer.innerHTML = "";
  photos.forEach(photo => {
    const img = document.createElement("img");
    img.src = photo.urls.small;
    img.alt = city;

    img.onclick = () => {
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.background = "rgba(0,0,0,0.8)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = "1000";

      const modalContent = document.createElement("div");
      modalContent.style.background = "#fff";
      modalContent.style.padding = "20px";
      modalContent.style.borderRadius = "10px";
      modalContent.style.textAlign = "center";
      modalContent.style.maxWidth = "600px";

      modalContent.innerHTML = `
        <h3>${city}</h3>
        <img src="${photo.urls.regular}" alt="${city}" style="max-width:100%; border-radius:10px;" />
        <br><br>
        <button id="saveTripBtn">Add to Trip Plan</button>
        <br><br>
        <button id="closeModal">Close</button>
      `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      document.getElementById("closeModal").onclick = () => modal.remove();
      document.getElementById("saveTripBtn").onclick = () => {
        saveTrip(city);
        modal.remove();
      };
    };

    photoContainer.appendChild(img);
  });
}

// Display Weather
function displayWeather(weather) {
  weatherContainer.innerHTML = "";
  if (!weather || weather.cod !== 200) {
    weatherContainer.innerHTML = `<p>⚠️ Weather not available</p>`;
    return;
  }
  weatherContainer.innerHTML = `
    <h2>${weather.name}, ${weather.sys.country}</h2>
    <p>🌡️ Temp: ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)</p>
    <p>🌤️ ${weather.weather[0].description}</p>
    <p>💧 Humidity: ${weather.main.humidity}%</p>
    <p>💨 Wind: ${weather.wind.speed} m/s</p>
  `;
}

// Display Map
function displayMap(city) {
  mapContainer.innerHTML = `
    <h2>📍 Location of ${city}</h2>
    <iframe
      src="https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(city)}"
      allowfullscreen>
    </iframe>
  `;
}

// Save to Trip Planner
function saveTrip(city) {
  let trips = JSON.parse(localStorage.getItem("tripPlan")) || [];
  if (!trips.includes(city)) {
    trips.push(city);
    localStorage.setItem("tripPlan", JSON.stringify(trips));
  }
  displayTripPlan();
}

// Display Trip Planner
function displayTripPlan() {
  let trips = JSON.parse(localStorage.getItem("tripPlan")) || [];
  tripPlanner.innerHTML = "<h2>🧳 My Trip Plan</h2>";
  if (trips.length === 0) {
    tripPlanner.innerHTML += "<p>No destinations added yet.</p>";
  }
  trips.forEach(city => {
    const p = document.createElement("p");
    p.textContent = city;
    tripPlanner.appendChild(p);
  });
}

// Main Search
async function searchDestination(query) {
  const info = await fetchInfo(query);
  const photos = await fetchPhotos(query);
  const weather = await fetchWeather(query);

  displayInfo(info, query);
  displayPhotos(photos, query);
  displayWeather(weather);
  displayMap(query);
}

// Events
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchDestination(query);
});

// Default Load
window.onload = () => {
  displayTripPlan();
  searchDestination("Paris"); // Default city
};
