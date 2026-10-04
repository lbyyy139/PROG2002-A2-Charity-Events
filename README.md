# PROG2002 Assignment 2 - Charity Events Website

**Student:** Boyu Liu (24832407)
**Unit:** PROG2002 Web Development II - Assessment 2 (Case Study: Dynamic Website)

A dynamic charity events website for a non-profit organisation. The public can view
the organisation's information, browse current and upcoming charity events, search
events by date, location and category, and read the full details of an event,
including its fundraising goal versus progress.

No CSS or JavaScript framework is used for the front end, and no server-side
templating is used. The pages are plain HTML, CSS and JavaScript; Node.js and
Express are used only to build the RESTful API on the server side.

## Architecture

```
Browser (HTML / CSS / JavaScript, DOM + Fetch)
        |  HTTP GET, JSON
        v
Node.js + Express REST API  (api/server.js)
        |  parameterised SQL
        v
MySQL database charityevents_db  (api/charityevents_db.sql)
```

## Repository structure

```
prog2002-a2-charity-events/
  api/                       Server-side: Node.js + Express + MySQL
    server.js                Express app with all GET endpoints
    event_db.js              MySQL connection pool (connection module)
    charityevents_db.sql     Database schema and sample data
    package.json             Dependencies (express, mysql2)
  clientside/                Client-side website (HTML, CSS, JavaScript)
    index.html               Home page
    search.html              Search events page
    event.html               Event details page
    css/style.css            Hand-written CSS
    js/api.js                API base URL, fetch helper, shared helpers
    js/home.js               Home page logic
    js/search.js             Search page logic
    js/event.js              Event details page logic
    images/                  SVG illustrations for the events
  docs/                      Project report and screenshots

## How to run

1. Import the database:
   `mysql -u root -p < api/charityevents_db.sql`
   (or use MySQL Workbench > Server > Data Import)
2. Set your MySQL credentials - either edit the `password` in the `defaultConfig`
   object inside `api/event_db.js`, or create `api/db-config.js`:
   ```js
   module.exports = { host: 'localhost', user: 'root',
                      password: 'your_password', database: 'charityevents_db' };
   ```
   `db-config.js` is ignored by git so real passwords are never committed.
3. Install and start the API:
   ```
   cd api
   npm install
   npm start
   ```
   The API then runs at http://localhost:3000
4. Open `clientside/index.html` in a browser and use the website.

## API endpoints (all GET - POST/PUT/DELETE belong to Assessment 3)

| Endpoint | Purpose |
|---|---|
| `GET /api/events` | All current and upcoming, non-suspended events (home page) |
| `GET /api/events/search?date=&location=&categoryId=` | Events matching any combination of the three criteria (search page) |
| `GET /api/events/:id` | Full details of a single event (event details page) |
| `GET /api/categories` | All event categories (search page dropdown) |

## Database summary

- `organisations` - the charitable organisations that host events
- `categories` - event types (Fun Run, Gala Dinner, Silent Auction, Concert, Community Festival)
- `events` - the charity events, linked to one organisation and one category by foreign keys

Sample data: 3 organisations, 5 categories and 10 events (8 current or upcoming,
2 past, 1 suspended), loaded with dates relative to `CURDATE()`.
