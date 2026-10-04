-- ============================================================================
-- charityevents_db.sql
-- PROG2002 Assignment 2 - Database for the Charity Events website
-- Author: Boyu Liu (24832407)
--
-- Import this file into MySQL to (re)create the database:
--   mysql -u root -p < charityevents_db.sql
-- or use MySQL Workbench: Server > Data Import > Import from Self-Contained File
-- ============================================================================

DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charityevents_db;

-- ----------------------------------------------------------------------------
-- Table: organisations
-- The charitable organisations that host the events.
-- ----------------------------------------------------------------------------
CREATE TABLE organisations (
    org_id        INT AUTO_INCREMENT PRIMARY KEY,
    org_name      VARCHAR(100)  NOT NULL,
    mission       TEXT          NOT NULL,
    description   TEXT          NULL,
    email         VARCHAR(100)  NOT NULL,
    phone         VARCHAR(30)   NOT NULL,
    address       VARCHAR(200)  NOT NULL,
    founded_year  INT           NOT NULL
);

-- ----------------------------------------------------------------------------
-- Table: categories
-- The type of each charity event (fun run, gala dinner, ...).
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id    INT AUTO_INCREMENT PRIMARY KEY,
    category_name  VARCHAR(50)   NOT NULL UNIQUE,
    description    VARCHAR(200)  NULL
);

-- ----------------------------------------------------------------------------
-- Table: events
-- The charity events shown on the website.
--  - event_date / end_date decide whether an event is 'past' or 'upcoming'
--    (compared with the current date in the API queries).
--  - is_suspended = 1 hides a policy-violating event from the public pages.
--  - goal_amount / raised_amount support the "Goal vs. Progress" display.
--  - ticket_price = 0.00 means free entry (a donation is still welcome).
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    event_id      INT AUTO_INCREMENT PRIMARY KEY,
    event_name    VARCHAR(150)  NOT NULL,
    event_date    DATETIME      NOT NULL,
    end_date      DATETIME      NULL,
    location      VARCHAR(100)  NOT NULL,                -- city / suburb
    venue         VARCHAR(150)  NOT NULL,                -- full venue name
    description   TEXT          NOT NULL,
    purpose       TEXT          NOT NULL,                -- the cause it supports
    ticket_price  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    goal_amount   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    image_url     VARCHAR(255)  NULL,
    org_id        INT           NOT NULL,
    category_id   INT           NOT NULL,
    is_suspended  TINYINT(1)    NOT NULL DEFAULT 0,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_org
        FOREIGN KEY (org_id) REFERENCES organisations (org_id),
    CONSTRAINT fk_events_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
);

-- Sample data is added in the next commit.
