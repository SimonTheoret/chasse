use self::schema::locations::{self, dsl::*};
use axum::{Router, extract::Json, http::StatusCode, response::Json as ResponseJson, routing::get};
use diesel::prelude::*;
use dotenvy::dotenv;
use geoutils::Location;
use models::{GeoLocation, NewGeoLocation};
use std::{
    env,
    sync::{Arc, Mutex},
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::{debug, info, instrument};
mod models;
mod schema;

#[instrument()]
pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let res = SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {database_url}"));
    info!("Database connection established");
    res
}

#[instrument(skip(conn))]
pub fn create_new_location(
    conn: &mut SqliteConnection,
    new_location: NewGeoLocation,
) -> Result<GeoLocation, diesel::result::Error> {
    debug!("POST create new location");
    let res = diesel::insert_into(locations::table)
        .values(&new_location)
        .returning(GeoLocation::as_returning())
        .get_result(conn);
    debug!("New location added: {:?}", new_location);
    res
}

type DbConnection = Arc<Mutex<SqliteConnection>>;

#[instrument(skip(db))]
async fn get_locations_list(
    db: axum::extract::State<DbConnection>,
) -> Result<ResponseJson<Vec<Location>>, StatusCode> {
    debug!("GET all locations");
    let mut conn = db.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let locs = locations
        .select(GeoLocation::as_select())
        .load(&mut *conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let locs: Vec<Location> = locs.into_iter().map(Location::from).collect();
    debug!("All locations returned: {:?}", locs);
    let res = ResponseJson(locs);
    Ok(res)
}

#[instrument(skip(db))]
async fn create_location(
    db: axum::extract::State<DbConnection>,
    Json(new_location): Json<NewGeoLocation>,
) -> Result<ResponseJson<GeoLocation>, StatusCode> {
    let mut conn = db.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    match create_new_location(&mut conn, new_location) {
        Ok(location) => Ok(ResponseJson(location)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let connection = Arc::new(Mutex::new(establish_connection()));
    let app = Router::new()
        .route("/locations", get(get_locations_list).post(create_location))
        //TODO: Set the cors to reasonable values for deployment
        .layer(ServiceBuilder::new().layer(CorsLayer::permissive()))
        .with_state(connection);

    info!("Server starting on http://0.0.0.0:3000");
    info!("API Endpoints:");
    info!("GET /locations - Get all hunting locations");
    info!("POST /locations - Create a new hunting location");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use pretty_assertions::assert_eq;
// }
