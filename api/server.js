/**
 * server.js
 * PROG2002 Assignment 2 - RESTful API for the Charity Events website
 * Author: Boyu Liu (24832407)
 *
 * The API serves JSON data from the MySQL database (charityevents_db) to the
 * client-side website.
 *
 * Endpoints:
 *   GET /api/events   - current & upcoming events (home page)
 */

const express = require('express');
const { query } = require('./event_db');

const app = express();
const PORT = 3000;

// ---------------------------------------------------------------------------
// CORS middleware
// The client-side website is served from a different origin (opened as static
// HTML files), so the API must explicitly allow cross-origin requests.
// Implemented manually - no third-party CORS package is used.
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// ---------------------------------------------------------------------------
// Shared SQL fragment: event data joined with its category and organisation
// ---------------------------------------------------------------------------
const EVENT_SELECT = `
    SELECT
        e.event_id,
        e.event_name,
        e.event_date,
        e.end_date,
        e.location,
        e.venue,
        e.description,
        e.purpose,
        e.ticket_price,
        e.goal_amount,
        e.raised_amount,
        e.image_url,
        e.is_suspended,
        o.org_id,
        o.org_name,
        c.category_id,
        c.category_name
    FROM events e
    INNER JOIN organisations o ON e.org_id = o.org_id
    INNER JOIN categories c    ON e.category_id = c.category_id
`;

// ---------------------------------------------------------------------------
// GET /api/events
// Purpose: list all current and upcoming charity events for the home page.
// "Current or upcoming" means the event date/time is in the future or today.
// Suspended events are never shown to the public.
// ---------------------------------------------------------------------------
app.get('/api/events', async (req, res) => {
    try {
        const rows = await query(
            EVENT_SELECT + `
            WHERE e.is_suspended = 0
              AND e.event_date >= NOW()
            ORDER BY e.event_date ASC`,
            []
        );
        res.json(rows);
    } catch (err) {
        console.error('GET /api/events failed:', err.message);
        res.status(500).json({ error: 'Failed to retrieve events.' });
    }
});

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Charity Events API is running at http://localhost:${PORT}`);
});
