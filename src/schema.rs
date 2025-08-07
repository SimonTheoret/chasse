// @generated automatically by Diesel CLI.

diesel::table! {
    locations (id) {
        id -> Integer,
        lat -> Double,
        lon -> Double,
    }
}
