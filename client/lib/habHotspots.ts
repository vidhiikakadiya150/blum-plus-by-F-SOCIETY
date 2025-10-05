export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "algal" | "vegetation" | "agricultural";
  intensity: "low" | "medium" | "high";
  country?: string;
  region?: string;
  nearestCity?: string;
  waterBody?: string; // lake, river, coastal, reservoir
  note?: string;
  links?: { label: string; href: string }[];
};

export const HAB_HOTSPOTS: Hotspot[] = [
  { id: "erie", name: "Lake Erie (CyAN)", lat: 41.7, lon: -82.6, type: "algal", intensity: "high", waterBody: "lake", country: "USA/Canada", region: "Great Lakes", nearestCity: "Cleveland", note: "Cyanobacteria blooms (Microcystis)", links: [{ label: "CyAN", href: "https://www.epa.gov/cyanoproject" }] },
  { id: "gom", name: "Gulf of Mexico (Karenia brevis)", lat: 27.4, lon: -84.0, type: "algal", intensity: "high", waterBody: "coastal", country: "USA", region: "Florida Shelf", nearestCity: "Tampa", note: "Red tide events", links: [{ label: "HABSOS", href: "https://products.coastalscience.noaa.gov/hab/status/" }] },
  { id: "baltic", name: "Baltic Sea Cyanobacteria", lat: 57.3, lon: 19.0, type: "algal", intensity: "medium", waterBody: "sea", country: "Multiple", region: "Baltic", nearestCity: "Stockholm", links: [{ label: "Earthdata", href: "https://earthdata.nasa.gov/" }] },
  { id: "china", name: "East China Sea", lat: 30.0, lon: 123.0, type: "algal", intensity: "medium" },
  { id: "gbr", name: "Great Barrier Reef", lat: -18.0, lon: 148.0, type: "algal", intensity: "medium" },
  { id: "med", name: "Mediterranean Sea", lat: 36.5, lon: 16.0, type: "algal", intensity: "low" },
  { id: "black", name: "Black Sea", lat: 43.0, lon: 34.0, type: "algal", intensity: "medium" },
  { id: "japan", name: "Sea of Japan", lat: 39.0, lon: 135.0, type: "algal", intensity: "low" },
  { id: "peru", name: "Peru Upwelling", lat: -12.0, lon: -78.0, type: "algal", intensity: "medium" },
  { id: "namib", name: "Namibian Upwelling", lat: -22.0, lon: 12.0, type: "algal", intensity: "medium" },
  { id: "indus", name: "Indus River Delta (agri)", lat: 24.0, lon: 67.5, type: "agricultural", intensity: "low" },
  { id: "nile", name: "Nile Delta (veg)", lat: 31.2, lon: 31.3, type: "vegetation", intensity: "low" },
  { id: "okhotsk", name: "Sea of Okhotsk", lat: 53.0, lon: 151.0, type: "algal", intensity: "low" },
  { id: "bayofbiscay", name: "Bay of Biscay", lat: 45.5, lon: -4.0, type: "algal", intensity: "low" },
  { id: "california", name: "California Current", lat: 36.0, lon: -124.0, type: "algal", intensity: "medium" },
];
