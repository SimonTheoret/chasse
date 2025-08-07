use crate::schema::locations;
use diesel::prelude::*;
use geoutils::Location;
use serde::{Deserialize, Serialize};

#[derive(Debug, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::locations)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct GeoLocation {
    id: i32,
    pub lat: f64,
    pub lon: f64,
}

impl From<GeoLocation> for Location {
    fn from(value: GeoLocation) -> Self {
        Self::new_const(value.lat, value.lon)
    }
}

#[derive(Debug, Insertable, Deserialize)]
#[diesel(table_name = locations)]
pub struct NewGeoLocation {
    pub lat: f64,
    pub lon: f64,
}
