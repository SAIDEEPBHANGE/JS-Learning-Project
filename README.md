# JavaScript Learning Projects

This repository documents a hands-on journey through vanilla JavaScript:
building browser applications, practicing core concepts, and exploring more
complex features one project at a time.

## Projects

| Project | What the current code explores |
| --- | --- |
| [To-Do App](./01-To-Do-App/README.md) | Task management, DOM events, local storage, and drag-and-drop |
| [Weather Dashboard](./02-Weather-Dashboard/README.md) | Asynchronous requests, weather APIs, location, and unit switching |
| [Expense Tracker](./03-Expense-Tracker/README.md) | Transactions, monthly summaries, local storage, charts, and CSV export |
| [Movie Search App](./04-Movie-Search-App/README.md) | TV show search, debouncing, API data, favorites, and watchlists |
| [Kanban Task Board](./05-Kanban-Task-Board/README.md) | Task cards, a modal form, persistent state, and drag-and-drop |

Each project README contains its current features, limitations, and a place
to add screenshots. See the [JavaScript roadmap](./JS-Road-Map/README.md)
for topics to explore beyond these projects.

## JavaScript concepts practiced

- Variables, functions, arrays, objects, and modern JavaScript syntax
- DOM manipulation, event handling, form input, and dynamic rendering
- CRUD operations, application state, browser local storage, and JSON
- Fetch, promises, async/await, external APIs, and error handling
- Search, filtering, pagination, drag-and-drop, and browser geolocation

The roadmap also includes topics that are goals for future study; its contents
should not be interpreted as a checklist of completed achievements.

## Running the projects

Serve the repository directory with a local web server. For example, with
Python installed, run:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/` and select a project directory, or visit its
`index.html` directly through the server. An internet connection is needed
for the CDN dependencies and the weather and TV-show APIs. Geolocation may
require browser permission and a secure context; localhost is normally
treated as secure.

## Structure

```text
JS-Learning-Project/
├── README.md
├── JS-Road-Map/
│   └── README.md
└── <project>/
    ├── README.md
    ├── index.html
    └── js/
        ├── README.md
        └── app.js
```

The five project directories follow this layout. Images may be added to their
project directories later.

## Built with

- HTML5 and vanilla JavaScript
- Bootstrap 5 and Bootstrap Icons, loaded from a CDN
- Chart.js for the expense tracker
- Open-Meteo and OpenStreetMap Nominatim for weather and location
- TVMaze for show data

The projects use Bootstrap classes rather than custom CSS. They are learning
projects, not production applications.

## Goals and future learning

Continue improving JavaScript fluency, debugging, accessibility, responsive
interfaces, application organization, and browser API usage. Potential next
topics include TypeScript, React, Node.js, and server-side development.

## Author

Saideep Arvind Bhange
