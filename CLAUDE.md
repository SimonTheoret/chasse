# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

This is a Rust project using Nix flakes for development environment. Enter the development shell:

```bash
nix develop
```

The development shell provides:

- Rust toolchain with rust-analyzer
- diesel-cli for database migrations
- cargo-nextest for testing
- cargo-insta for snapshot testing
- sql-studio for database inspection
- Node.js 24 with TypeScript tooling

## Database Setup

This project uses Diesel ORM with SQLite. Set up the database:

```bash
# Set DATABASE_URL environment variable (create .env file)
echo "DATABASE_URL=database.db" > .env

# Run migrations to create tables and seed data
diesel migration run
```

## Common Commands

```bash
# Build the project
cargo build

# Run the application (starts web server on port 3000)
cargo run

# Run tests
cargo test
# or use nextest for better output
cargo nextest run

# Database operations
diesel migration run          # Apply all pending migrations
diesel migration revert      # Revert last migration
diesel print-schema          # Print current database schema

# Code formatting and linting
cargo fmt
cargo clippy
```

## Architecture

This is a hunting location tracking web service that serves both API endpoints and a web interface from a single Rust binary:

### Backend (Rust + Axum)
- **Database Layer**: SQLite with Diesel ORM
  - `schema.rs` - Auto-generated database schema (locations table: id, lat, lon)
  - `models.rs` - Diesel models: `GeoLocation` and `NewGeoLocation`
  - `migrations/` - Database migration files

- **Web Server**: `main.rs`
  - Axum web server on port 3000
  - Database connection management with Arc<Mutex<SqliteConnection>>
  - CORS enabled for development
  - Askama templates for HTML rendering
  - Tower middleware for live reload and CORS
  - Endpoints:
    - `GET /` - Serves main HTML page with embedded locations
    - `GET /locations` - Returns HTML fragment with location list
    - `POST /locations` - Create new location from JSON, returns JSON

- **Data Model**:
  - `GeoLocation` struct with id, lat, lon fields
  - Integration with `geoutils` crate for geographic calculations
  - Automatic conversion from GeoLocation to geoutils::Location

### Frontend (Server-Side Rendered)
- **Templates**: Askama templates in `templates/`
  - `index.html` - Main page template with embedded Leaflet map
  - Displays location list and interactive map
  - Form for adding new locations via HTMX
  
- **Static Assets**: Served from `templates/static/`
  - Leaflet CSS and JavaScript for mapping
  - HTMX for dynamic form submissions
  - Map centered on Montreal area by default

### Key Dependencies
- **Backend**: axum, diesel, geoutils, tokio, tracing, askama, moka, tower-livereload
- **Frontend**: Leaflet for mapping, HTMX for dynamic interactions (served as static files)
