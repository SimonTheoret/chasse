import "./style.css";
import { LocationEntry } from "./types";
import { CRS } from "leaflet";

export class LocationList {
  locs: LocationEntry[];
  showedLocs: LocationEntry[];
  showNumLoc: number;
  userPos: { lat: number; lon: number } | null = null;
  constructor(
    locs: LocationEntry[],
    showNumLoc: number = 5,
    userPos: { lat: number; lon: number } | null = null,
  ) {
    this.locs = locs;
    this.showNumLoc = showNumLoc;
    this.userPos = userPos;
    this.showedLocs = this.locs.slice(0, this.showNumLoc);
  }
  filterLocByNum(): void {
    while (this.locs.length > this.showNumLoc) {
      this.locs.pop();
    }
  }
  currentLocList(): LocationEntry[] {
    return this.locs;
  }
  sortByDistance(): void {
    if (this.userPos !== null) {
      const userLat = this.userPos.lat;
      const userLon = this.userPos.lon;
      this.locs.sort((a, b) => {
        return (
          CRS.EPSG3857.distance([a.lat, a.lon], [userLat, userLon]) -
          CRS.Earth.distance([b.lat, b.lon], [userLat, userLon])
        );
      });
    }

    // We update the showedLocs, to avoid any problem
    this.showedLocs = this.locs.slice(0, this.showNumLoc);
  }
}
