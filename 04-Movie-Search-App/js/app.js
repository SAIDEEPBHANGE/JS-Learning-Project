const BASE_URL = "https://api.tvmaze.com";
const showContainer = document.getElementById("showContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
// 1. Fetch default landing page shows
async function getShows() {
  try {
    const response = await fetch(`${BASE_URL}/shows`);
    const data = await response.json();
    displayShows(data.slice(0, 24)); // Display top 24 shows
  } catch (error) {
    console.error("Error fetching initial shows:", error);
    showContainer.innerHTML = `<p class="text-danger text-center fw-bold">Failed to load shows. Try again later.</p>`;
  }
}
// 2. Fetch searched shows
async function searchShows() {
  const query = searchInput.value.trim();
  if (!query) return; // Don't search if empty
  showContainer.innerHTML = `
    <div class="text-center col-11 mx-auto py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>`;
  try {
    const response = await fetch(`${BASE_URL}/search/shows?q=${query}`);
    const data = await response.json();
    // The search endpoint nests data inside { score, show }. We map it to extract just the show objects.
    const cleanData = data.map((item) => item.show);
    displayShows(cleanData);
  } catch (error) {
    console.error("Error searching shows:", error);
    showContainer.innerHTML = `<p class="text-danger text-center fw-bold">Something went wrong while searching.</p>`;
  }
}
// 3. Render HTML Cards
function displayShows(shows) {
  if (shows.length === 0) {
    showContainer.innerHTML = `
      <div class="text-center col-12 py-5 text-muted">
        <i class="bi bi-exclamation-circle fs-1"></i>
        <p class="mt-2 fw-bold">No shows found. Try another search!</p>
      </div>`;
    return;
  }
  let cards = "";
  shows.forEach((show) => {
    // Generate genre badges safely
    const genresHTML =
      show.genres && show.genres.length > 0
        ? show.genres
            .map(
              (g) => `<span class="badge text-bg-danger me-1 mb-1">${g}</span>`,
            )
            .join("")
        : '<span class="text-muted small">No genre</span>';
    cards += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 d-flex flex-column">
          <img 
            src="${show.image?.medium || "https://placeholder.co/300x420?text=No+Image"}" 
            class="card-img-top" 
            alt="${show.name}"
            loading="lazy"
          >
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title fw-bold text-truncate" title="${show.name}">${show.name}</h5>
              <div class="mb-2 d-flex flex-wrap">${genresHTML}</div>
              <p class="rating mb-1">⭐ ${show.rating?.average || "N/A"}</p>
              <p class="text-muted small mb-3">
                ${show.language || "Unknown"} • ${show.status || "N/A"}
              </p>
            </div>
            <a href="${show.url}" target="_blank" class="btn btn-outline-danger w-100 mt-auto">
              <i class="bi bi-box-arrow-up-right me-1"></i> Details
            </a>
          </div>
        </div>
      </div>
    `;
  });
  showContainer.innerHTML = cards;
}
// --- Event Listeners ---
searchBtn.addEventListener("click", searchShows);
// Allow pressing "Enter" key to search
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchShows();
  }
});
// Run default shows on start
getShows();
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  getShows();
});
