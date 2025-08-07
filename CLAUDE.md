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
# or with debug logging
RUST_LOG=DEBUG cargo run

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

# Development with justfile commands
just dev_front               # Start Vite frontend dev server
just dev_back                # Start Rust backend with debug logging

# Frontend development (separate Vite project in frontend/)
cd frontend && npm run dev    # Start Vite dev server
cd frontend && npm run build  # Build frontend assets
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
    - `GET /locations` - Returns JSON array of all hunting locations
    - `POST /locations` - Create new location from JSON, returns created location JSON

- **Data Model**:
  - `GeoLocation` struct with id, lat, lon fields
  - Integration with `geoutils` crate for geographic calculations
  - Automatic conversion from GeoLocation to geoutils::Location

### Frontend (TypeScript/Vite Project)
**Separate TypeScript/Vite Project (frontend/)**:
- Modern TypeScript development with Vite
- Leaflet with TypeScript definitions for interactive mapping
- Alpine.js for reactive components
- HTMX for dynamic interactions
- Independent build process and development server
- Can be built and integrated with the main server

### Key Dependencies
- **Backend**: axum, diesel, geoutils, tokio, tracing, tower-http (cors, fs), serde, derive_more, uuid
- **Frontend (Vite)**: TypeScript, Vite, Leaflet with types, Alpine.js, HTMX

## Development Notes
- Database connection is shared via `Arc<Mutex<SqliteConnection>>` - single connection for simplicity
- CORS set to permissive for development (TODO: restrict for production)
- All geographic data uses `geoutils::Location` for calculations
- Server runs on port 3000 and serves API endpoints only (no web interface currently)
