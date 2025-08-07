import "./style.css";
import "leaflet/dist/leaflet.css";
import "htmx.org";
import Alpine from "alpinejs";
import { GlobalLocations } from "./types";
import { LocationList } from "./location_list";

declare const window: any;
window.Alpine = Alpine;

var userPosition: { lat: number; lon: number } | null = null;
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log(`User location: ${lat}, ${lon}`);
    userPosition = { lat: lat, lon };
  },
  (error) => {
    console.error("Error getting user location:", error);
  },
);

var globalLocations = new GlobalLocations();
var locationList = new LocationList(globalLocations.locations, 5, userPosition);

// Global structure containing all the locations
Alpine.store("globalLocations", globalLocations);

// Components

// List of locations. They are sorted by ascending distance from the user
Alpine.data("locationList", () => {
  return locationList;
});

Alpine.start();

// function sendNewLoc(location: { lat: number; lon: number }) {
//   fetch("/locations", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json", // Indicate the type of data being sent
//     },
//     body: JSON.stringify(location),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json(); // Parse the JSON response from the server
//     })
//     .then((data) => {
//       console.log("Success:", data); // Handle the successful response data
//     })
//     .catch((error) => {
//       console.error("Error:", error); // Handle any errors during the request
//     });
// }

// // Get user's current location

// const map = new MapComponent("map", {
//   center: [45.5017, -73.5673], // MTL
//   zoom: 10,
// });

// // Initialize map
// map.init();

// // Handle form submission for adding new locations
// const form = document.getElementById("add-location-form") as HTMLFormElement;
// const latInput = document.getElementById("lat") as HTMLInputElement;
// const lonInput = document.getElementById("lon") as HTMLInputElement;

// form.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const lat = parseFloat(latInput.value);
//   const lon = parseFloat(lonInput.value);

//   if (!isNaN(lat) && !isNaN(lon)) {
//     map.addLocation({ lat, lon });
//     latInput.value = "";
//     lonInput.value = "";
//     sendNewLoc({ lat, lon });
//   }
// });

// // Handle map clicks to add locations
// map.onClick((e) => {
//   const { lat, lng } = e.latlng;
//   map.addLocation({ lat, lon: lng });
//   // sendNewLoc({ lat, lon: lng });
// });
