/**
 * server.js
 * PROG2002 Assignment 2 - RESTful API for the Charity Events website
 * Author: Boyu Liu (24832407)
 *
 * The API serves JSON data from the MySQL database (charityevents_db) to the
 * client-side website. Only GET endpoints are implemented in Assignment 2;
 * POST / PUT / DELETE will be added in Assignment 3.
 *
 * Endpoints:
 *   GET /api/events            - current & upcoming events (home page)
 *   GET /api/events/search     - filter events by date, location, category (search page)
 *   GET /api/events/:id        - full details of one event (event details page)
 *   GET /api/categories        - list of event categories (search page dropdown)
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
// GET /api/events/search?date=YYYY-MM-DD&location=...&categoryId=...
// Purpose: search active (non-suspended) events by any combination of the
// three criteria. All criteria are optional and combined with AND logic.
// ---------------------------------------------------------------------------
app.get('/api/events/search', async (req, res) => {
    try {
        const { date, location, categoryId } = req.query;

        // ---- Server-side input validation -------------------------------------
        const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
        if (date && !DATE_PATTERN.test(date)) {
            return res.status(400).json({
                error: 'Invalid date format. Expected YYYY-MM-DD.'
            });
        }
        if (location && location.length > 100) {
            return res.status(400).json({
                error: 'Location text is too long (maximum 100 characters).'
            });
        }
        if (categoryId && !/^\d+$/.test(categoryId)) {
            return res.status(400).json({
                error: 'Invalid category. Category must be a number.'
            });
        }

        // ---- Build the WHERE clause dynamically from the given criteria ------
        let sql = EVENT_SELECT + ' WHERE e.is_suspended = 0';
        const params = [];

        if (date) {
            // Match events that start on the selected day.
            sql += ' AND DATE(e.event_date) = ?';
            params.push(date);
        }
        if (location) {
            // Case-insensitive partial match on city / venue.
            sql += ' AND (e.location LIKE ? OR e.venue LIKE ?)';
            const pattern = `%${location}%`;
            params.push(pattern, pattern);
        }
        if (categoryId) {
            sql += ' AND e.category_id = ?';
            params.push(categoryId);
        }

        sql += ' ORDER BY e.event_date ASC';

        const rows = await query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /api/events/search failed:', err.message);
        res.status(500).json({ error: 'Failed to search events.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/events/:id
// Purpose: full details of a single event for the event details page.
// Returns 404 when the event does not exist or has been suspended.
// ---------------------------------------------------------------------------
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        // Validate that the id is a positive integer.
        if (!/^\d+$/.test(eventId)) {
            return res.status(400).json({ error: 'Invalid event id.' });
        }

        const rows = await query(
            EVENT_SELECT + `
            WHERE e.event_id = ?
              AND e.is_suspended = 0`,
            [eventId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Event not found or no longer available.'
            });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /api/events/:id failed:', err.message);
        res.status(500).json({ error: 'Failed to retrieve the event.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/categories
// Purpose: list of event categories used to populate the search form dropdown.
// ---------------------------------------------------------------------------
app.get('/api/categories', async (req, res) => {
    try {
        const rows = await query(
            `SELECT category_id, category_name, description
             FROM categories
             ORDER BY category_name ASC`,
            []
        );
        res.json(rows);
    } catch (err) {
        console.error('GET /api/categories failed:', err.message);
        res.status(500).json({ error: 'Failed to retrieve categories.' });
    }
});

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Charity Events API is running at http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /api/events');
    console.log('  GET /api/events/search?date=&location=&categoryId=');
    console.log('  GET /api/events/:id');
    console.log('  GET /api/categories');
});
