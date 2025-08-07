import * as L from "leaflet";

export interface Location {
  lat: number;
  lon: number;
  id?: number;
}

export class MapComponent {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private containerId: string;
  private options: {
    center: [number, number];
    zoom: number;
  };

  constructor(
    containerId: string,
    options: Partial<{ center: [number, number]; zoom: number }> = {},
  ) {
    this.containerId = containerId;
    this.options = {
      center: [45.5017, -73.5673], // Montreal coordinates
      zoom: 10,
      ...options,
    };
  }

  init(): this {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with id '${this.containerId}' not found`);
    }

    this.map = L.map(this.containerId).setView(
      this.options.center,
      this.options.zoom,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
      this.map,
    );

    return this;
  }

  addLocation(location: Location, options: L.MarkerOptions = {}): L.Marker {
    if (!this.map) {
      throw new Error("Map not initialized. Call init() first.");
    }

    const marker = L.marker([location.lat, location.lon], options).addTo(
      this.map,
    );
    this.markers.push(marker);
    return marker;
  }

  addLocations(locations: Location[]): void {
    locations.forEach((location) => {
      this.addLocation(location);
    });

    if (locations.length > 0) {
      this.fitToMarkers();
    }
  }

  fitToMarkers(): void {
    if (!this.map || this.markers.length === 0) return;

    const group = new L.FeatureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  clearMarkers(): void {
    if (!this.map) return;

    this.markers.forEach((marker) => {
      this.map!.removeLayer(marker);
    });
    this.markers = [];
  }

  onClick(callback: (event: L.LeafletMouseEvent) => void): void {
    if (!this.map) {
      throw new Error("Map not initialized. Call init() first.");
    }

    this.map.on("click", callback);
  }

  getMap(): L.Map | null {
    return this.map;
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
    }
  }
}
