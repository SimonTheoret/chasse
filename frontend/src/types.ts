export class LocationEntry {
  lat: number;
  lon: number;
  id: number | null = null;
  focusOnMap(map: MapComponent): void {
    // TODO: Implement logic here
  }
  constructor(lat: number, lon: number, id: number | null = null) {
    this.lat = lat;
    this.lon = lon;
    this.id = id;
  }
  prettyString(): string {
    return `Latitude: ${this.lat.toFixed(4)}, Longitude: ${this.lon.toFixed(4)}`;
  }
}

export class GlobalLocations {
  locations: LocationEntry[] = [];
  async getLocations(): Promise<void> {
    try {
      const response = await fetch("/locations");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const locs: LocationEntry[] = await response.json();
      this.locations = locs;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
  constructor(locations = []) {
    this.locations = locations;
    this.getLocations();
  }
}
