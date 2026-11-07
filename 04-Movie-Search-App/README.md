# Movie Search App

Browse and search TV shows using TVMaze, and keep local favorites and a
watchlist.

## Current features

- Browse an initial show collection, search with a debounce, and filter by
  genre.
- View show details, ratings, and a trailer-search embed; load more results
  as the page is scrolled.
- Save favorites and watchlist entries in local storage.
- Use a mock guest login. It is not real authentication.

Results and the trailer embed depend on external services; the initial
"Trending Shows" view uses the API's general shows endpoint rather than a
verified trending ranking.

## JavaScript concepts

Fetch, async/await, debouncing, dynamic rendering, state, local storage,
filtering, and the Intersection Observer API.

## Function flow

The diagram shows the main paths in [`js/app.js`](./js/app.js). Dashed
arrows represent callbacks triggered by later interactions.

```mermaid
flowchart TD
    Start["DOMContentLoaded"] --> Auth["initAuth"]
    Start --> Badges["updateBadges"]
    Start --> Trending["getTrendingShows"]
    Start --> Scroll["setupInfiniteScroll"]
    Trending -->|fetch shows| Filters["applyFiltersAndRender"]
    Search["Search input"] --> Debounce["debounceSearch"]
    Debounce -->|search result| Reset["resetGenreActiveState"]
    Debounce -->|empty query or search result| Filters
    Genre["Genre click"] --> Filters
    Nav["Navigation click"] --> Tab["changeActiveTab"]
    Tab --> Filters
    Filters --> Grid["renderGrid"]
    Scroll -.->|more results visible| Grid
    Grid -.->|details clicked| Details["openDetailsModal"]
    Details -->|if show is not cached| API["Fetch show from TVMaze"]
    Grid -.->|favorite or watchlist clicked| Toggle["toggleFavorite or toggleWatchlist"]
    Toggle --> Find["findShowInStateCache"]
    Toggle --> Badges
    Toggle --> View["renderCurrentView"]
    View --> Filters
    Auth -.->|login or logout clicked| Login["handleLogin or handleLogout"]
    Login --> Auth
    Login --> View
```

Search waits 400 ms before requesting results. Favorites, watchlist entries,
and the mock login are stored locally.

## Run and dependencies

Follow the [repository setup](../README.md#running-the-projects) and open
`04-Movie-Search-App/index.html`. Bootstrap, Bootstrap Icons, TVMaze, and
external images and trailer content require network access.

## Screenshot

Add `image.png` to this project folder to display the screenshot below.

![Movie Search App screenshot](./image.png)
