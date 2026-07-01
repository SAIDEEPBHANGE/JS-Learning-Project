const BASE_URL = "https://api.tvmaze.com";
// DOM Elements
const showContainer = document.getElementById("showContainer");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const genreBtns = document.querySelectorAll(".genre-btn");
const sectionTitle = document.getElementById("sectionTitle");
const resultStats = document.getElementById("resultStats");
const scrollTrigger = document.getElementById("infiniteScrollTrigger");
const authSection = document.getElementById("authSection");
// Nav Links
const navHome = document.getElementById("navHome");
const navFavorites = document.getElementById("navFavorites");
const navWatchlist = document.getElementById("navWatchlist");
const brandLogo = document.getElementById("brandLogo");
// App State
let currentView = "home"; // 'home', 'favorites', 'watchlist'
let allShowsCache = []; // Cached initial shows for sorting/filtering
let filteredShows = []; // Active filtered subset
let currentPage = 0; // For infinite scrolling pagination
const itemsPerPage = 12;
let selectedGenre = "all";
let searchTimeoutId = null;
// Persistent User State (Local Storage)
let currentUser = JSON.parse(localStorage.getItem("moviehub_user")) || null;
let favorites = JSON.parse(localStorage.getItem("moviehub_favs")) || [];
let watchlist = JSON.parse(localStorage.getItem("moviehub_watch")) || [];
// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  updateBadges();
  getTrendingShows();
  setupInfiniteScroll();
});
// --- Authentication Mock ---
function initAuth() {
  if (currentUser) {
    authSection.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle fs-5 text-danger"></i> Hi, ${currentUser.username}
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      </div>`;
    document
      .getElementById("logoutBtn")
      .addEventListener("click", handleLogout);
  } else {
    authSection.innerHTML = `
      <button class="btn btn-danger btn-sm px-4 fw-bold rounded-pill" id="loginBtn">
        <i class="bi bi-box-arrow-in-right me-1"></i> Mock Login
      </button>`;
    document.getElementById("loginBtn").addEventListener("click", handleLogin);
  }
}
function handleLogin() {
  currentUser = { username: "Guest User" };
  localStorage.setItem("moviehub_user", JSON.stringify(currentUser));
  initAuth();
  renderCurrentView();
}
function handleLogout() {
  currentUser = null;
  localStorage.removeItem("moviehub_user");
  initAuth();
  renderCurrentView();
}
// --- Data Fetching ---
async function getTrendingShows() {
  showContainer.innerHTML = `
    <div class="text-center col-12 py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>`;
  try {
    const response = await fetch(`${BASE_URL}/shows`);
    const data = await response.json();
    // Use the main API array as our local dataset pool
    allShowsCache = data;
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error fetching shows:", error);
    showContainer.innerHTML = `<p class="text-danger text-center fw-bold">Failed to load trending shows.</p>`;
  }
}
// Optimized Search with Debounce implementation
function debounceSearch() {
  clearTimeout(searchTimeoutId);
  searchTimeoutId = setTimeout(async () => {
    const query = searchInput.value.trim();
    if (!query) {
      currentView = "home";
      applyFiltersAndRender();
      return;
    }
    showContainer.innerHTML = `
      <div class="text-center col-12 py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>`;
    try {
      const response = await fetch(
        `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      allShowsCache = data.map((item) => item.show);
      selectedGenre = "all"; // Reset genre on explicit global query text string
      resetGenreActiveState();
      applyFiltersAndRender();
    } catch (error) {
      console.error("Search error:", error);
    }
  }, 400); // 400ms delay window
}
// --- Filtering & Pagination State Engine ---
function applyFiltersAndRender() {
  // 1. Pick correct Source collection
  let sourceList = [];
  if (currentView === "home") {
    sourceList = allShowsCache;
    sectionTitle.innerText = searchInput.value.trim()
      ? `Search Results`
      : "Trending Shows";
  } else if (currentView === "favorites") {
    sourceList = favorites;
    sectionTitle.innerText = "Your Favorites";
  } else if (currentView === "watchlist") {
    sourceList = watchlist;
    sectionTitle.innerText = "Your Watchlist";
  }
  // 2. Filter by selected Genre standard
  if (selectedGenre !== "all") {
    filteredShows = sourceList.filter(
      (show) => show.genres && show.genres.includes(selectedGenre),
    );
  } else {
    filteredShows = sourceList;
  }
  // 3. Reset pagination chunk index and render
  currentPage = 1;
  renderGrid(false);
}
function renderGrid(append = false) {
  const startIndex = 0;
  const endIndex = currentPage * itemsPerPage;
  const paginatedSlice = filteredShows.slice(startIndex, endIndex);
  resultStats.innerText = `Showing ${Math.min(endIndex, filteredShows.length)} of ${filteredShows.length} titles`;
  if (paginatedSlice.length === 0) {
    if (!append) {
      showContainer.innerHTML = `
        <div class="text-center col-12 py-5 text-muted">
          <i class="bi bi-patch-exclamation fs-1"></i>
          <p class="mt-2 fw-bold">No shows fit this perspective. Try altering filters!</p>
        </div>`;
    }
    scrollTrigger.classList.add("d-none");
    return;
  }
  let cardsHTML = "";
  paginatedSlice.forEach((show) => {
    const isFav = favorites.some((f) => f.id === show.id);
    const isWatch = watchlist.some((w) => w.id === show.id);
    const releaseYear = show.premiered ? show.premiered.split("-")[0] : "N/A";
    const genresHTML =
      show.genres && show.genres.length > 0
        ? show.genres
            .slice(0, 2)
            .map(
              (g) =>
                `<span class="badge bg-secondary bg-opacity-20 text-dark me-1 mb-1 small">${g}</span>`,
            )
            .join("")
        : '<span class="text-muted small">No Genre</span>';
    cardsHTML += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 position-relative shadow-sm border-0 transition-all">
          <div class="position-absolute top-0 end-0 m-2 d-flex flex-column gap-1 z-2">
            <button class="btn btn-sm blur-btn ${isFav ? "text-danger" : "text-white"}" onclick="toggleFavorite(${show.id}, event)" title="Favorite">
              <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
            </button>
            <button class="btn btn-sm blur-btn ${isWatch ? "text-warning" : "text-white"}" onclick="toggleWatchlist(${show.id}, event)" title="Watchlist">
              <i class="bi ${isWatch ? "bi-bookmark-dash-fill" : "bi-bookmark-dash"}"></i>
            </button>
          </div>
          <img 
            src="${show.image?.medium || "https://placehold.co/300x420?text=No+Image"}" 
            class="card-img-top object-fit-cover" 
            alt="${show.name}"
            style="height: 320px;"
            loading="lazy"
          >
          <div class="card-body d-flex flex-column justify-content-between p-3">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-1">
                <h6 class="card-title fw-bold text-truncate mb-0 flex-grow-1" title="${show.name}">${show.name}</h6>
                <span class="badge bg-warning text-dark ms-1 small"><i class="bi bi-star-fill"></i> ${show.rating?.average || "N/A"}</span>
              </div>
              <p class="text-muted small mb-2">${releaseYear} • ${show.language || "Unknown"}</p>
              <div class="mb-3">${genresHTML}</div>
            </div>
            <button onclick="openDetailsModal(${show.id})" class="btn btn-danger w-100 rounded-3 btn-sm fw-semibold mt-auto">
              <i class="bi bi-play-circle me-1"></i> View Details
            </button>
          </div>
        </div>
      </div>`;
  });
  showContainer.innerHTML = cardsHTML;
  // Manage visibility state of scroll trigger point
  if (endIndex < filteredShows.length) {
    scrollTrigger.classList.remove("d-none");
  } else {
    scrollTrigger.classList.add("d-none");
  }
}
// --- Infinite Scroll Setup ---
function setupInfiniteScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      console.log(entries);
      if (
        entries[0].isIntersecting &&
        filteredShows.length > currentPage * itemsPerPage
      ) {
        currentPage++;
        renderGrid(true);
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(scrollTrigger);
}
// --- Detail Modal Generation + Mock Trailer Feature ---
window.openDetailsModal = async function (showId) {
  const myModal = new bootstrap.Modal(document.getElementById("detailModal"));
  const modalContentContainer = document.getElementById("modalDynamicContent");
  modalContentContainer.innerHTML = `
    <div class="p-5 text-center">
      <div class="spinner-border text-danger" role="status"></div>
    </div>`;
  myModal.show();
  try {
    // Find matching object globally from local view state collections
    let targetShow =
      allShowsCache.find((s) => s.id === showId) ||
      favorites.find((s) => s.id === showId) ||
      watchlist.find((s) => s.id === showId);
    if (!targetShow) {
      const response = await fetch(`${BASE_URL}/shows/${showId}`);
      targetShow = await response.json();
    }
    const cleanSummary = targetShow.summary
      ? targetShow.summary
      : "<p>No summary details provided.</p>";
    const year = targetShow.premiered
      ? targetShow.premiered.split("-")[0]
      : "N/A";
    // Dynamic Mock Trailer Link matching context item name dynamically
    const mockTrailerSearchQuery = encodeURIComponent(
      `${targetShow.name} official trailer`,
    );
    const mockEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${mockTrailerSearchQuery}`;
    modalContentContainer.innerHTML = `
      <div class="row g-0">
        <div class="col-md-5 d-none d-md-block">
          <img src="${targetShow.image?.original || targetShow.image?.medium || "https://placehold.co/400x600?text=No+Preview"}" class="img-fluid w-100 h-100 object-fit-cover" alt="Cover">
        </div>
        <div class="col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-between">
          <div>
            <h2 class="fw-black text-white mb-1">${targetShow.name}</h2>
            <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span class="badge text-bg-warning"><i class="bi bi-star-fill"></i> ${targetShow.rating?.average || "N/A"}</span>
              <span class="text-white-50 small">${year}</span>
              <span class="text-white-50 small">•</span>
              <span class="text-white-50 small">${targetShow.runtime ? targetShow.runtime + " mins" : "N/A"}</span>
            </div>
            <h5 class="text-danger fw-bold mb-2">Overview</h5>
            <div class="text-white-50 small summary-box mb-4">${cleanSummary}</div>
            <div class="accordion accordion-flush" id="trailerAccordion">
              <div class="accordion-item bg-transparent border-0">
                <h2 class="accordion-header">
                  <button class="btn btn-danger w-100 collapsed text-start d-flex align-items-center gap-2 rounded-3 fw-bold shadow-sm" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne">
                    <i class="bi bi-play-btn-fill fs-5"></i> Watch Dynamic Video Trailer
                  </button>
                </h2>
                <div id="flush-collapseOne" class="accordion-collapse collapse mt-2" data-bs-parent="#trailerAccordion">
                  <div class="ratio ratio-16x9 rounded-3 overflow-hidden border border-secondary">
                    <iframe src="${mockEmbedUrl}" title="Trailer" allowfullscreen></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span class="small text-white-50">Network: ${targetShow.network?.name || targetShow.webChannel?.name || "Unknown"}</span>
            <a href="${targetShow.url}" target="_blank" class="btn btn-outline-light btn-sm rounded-pill px-3">
              View on TVMaze <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
        </div>
      </div>`;
  } catch (err) {
    modalContentContainer.innerHTML = `<p class="p-4 text-center text-danger">Error aggregating modal metrics payload.</p>`;
  }
};
// --- Storage Manipulation Actions ---
window.toggleFavorite = function (showId, event) {
  event.stopPropagation();
  const showObj = findShowInStateCache(showId);
  if (!showObj) return;
  const idx = favorites.findIndex((f) => f.id === showId);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(showObj);
  }
  localStorage.setItem("moviehub_favs", JSON.stringify(favorites));
  updateBadges();
  renderCurrentView();
};
window.toggleWatchlist = function (showId, event) {
  event.stopPropagation();
  const showObj = findShowInStateCache(showId);
  if (!showObj) return;
  const idx = watchlist.findIndex((w) => w.id === showId);
  if (idx > -1) {
    watchlist.splice(idx, 1);
  } else {
    watchlist.push(showObj);
  }
  localStorage.setItem("moviehub_watch", JSON.stringify(watchlist));
  updateBadges();
  renderCurrentView();
};
function findShowInStateCache(showId) {
  return (
    allShowsCache.find((s) => s.id === showId) ||
    favorites.find((s) => s.id === showId) ||
    watchlist.find((s) => s.id === showId)
  );
}
function updateBadges() {
  document.getElementById("favCount").innerText = favorites.length;
  document.getElementById("watchCount").innerText = watchlist.length;
}
function resetGenreActiveState() {
  genreBtns.forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector('.genre-btn[data-genre="all"]')
    .classList.add("active");
}
function renderCurrentView() {
  applyFiltersAndRender();
}
// --- Event Routing Triggers ---
searchInput.addEventListener("input", debounceSearch);
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  selectedGenre = "all";
  resetGenreActiveState();
  currentView = "home";
  getTrendingShows();
});
genreBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    genreBtns.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    selectedGenre = e.target.getAttribute("data-genre");
    applyFiltersAndRender();
  });
});
// View Navigation Actions
navHome.addEventListener("click", (e) => {
  e.preventDefault();
  changeActiveTab(navHome, "home");
});
navFavorites.addEventListener("click", (e) => {
  e.preventDefault();
  changeActiveTab(navFavorites, "favorites");
});
navWatchlist.addEventListener("click", (e) => {
  e.preventDefault();
  changeActiveTab(navWatchlist, "watchlist");
});
brandLogo.addEventListener("click", (e) => {
  e.preventDefault();
  changeActiveTab(navHome, "home");
});
function changeActiveTab(targetElement, viewName) {
  [navHome, navFavorites, navWatchlist].forEach((el) =>
    el.classList.remove("active"),
  );
  targetElement.classList.add("active");
  currentView = viewName;
  applyFiltersAndRender();
}
