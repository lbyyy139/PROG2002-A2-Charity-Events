/**
 * home.js
 * Home page logic:
 *  1. calls GET /api/events to obtain the current & upcoming events,
 *  2. renders each event as a card using the DOM API.
 * Author: Boyu Liu (24832407)
 */

(function () {
    'use strict';

    const grid = document.getElementById('event-grid');
    const messageBox = document.getElementById('home-message');

    /** Shows a loading / error message inside the page (DOM manipulation). */
    function showMessage(text, isError) {
        messageBox.textContent = text;
        messageBox.className = isError ? 'message error' : 'message info';
        messageBox.hidden = false;
    }

    /** Hides the message area again. */
    function hideMessage() {
        messageBox.hidden = true;
    }

    /** Renders the list of events returned by the API. */
    function renderEvents(events) {
        // Remove the loading placeholder / previous cards
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }

        if (!events || events.length === 0) {
            showMessage('No current or upcoming events at the moment. Please check back soon!', false);
            return;
        }
        hideMessage();

        events.forEach(function (event) {
            // buildEventCard returns the HTML string for one card;
            // insertAdjacentHTML is a safe, simple way to append it.
            grid.insertAdjacentHTML('beforeend', buildEventCard(event));
        });
    }

    // ---- Load the events as soon as the page is ready ---------------------
    showMessage('Loading events...', false);

    fetchJSON(API_BASE + '/api/events')
        .then(function (events) {
            renderEvents(events);
        })
        .catch(function (err) {
            console.error(err);
            showMessage(
                'Sorry, the events could not be loaded. Please make sure the API server is running.',
                true
            );
        });
    // Show the current year in the footer automatically,
    // so the copyright notice never goes out of date.
    document.getElementById('footer-year').textContent = new Date().getFullYear();
})();
