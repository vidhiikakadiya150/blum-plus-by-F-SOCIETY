import * as Cesium from "cesium";

export type GibsDataset = {
  id: string;
  title: string;
  layer: string;
  tileMatrixSet: "GoogleMapsCompatible";
  format: "png" | "jpg";
  sourceUrl: string;
  legend: {
    min: number;
    max: number;
    unit: string;
    gradient: string[]; // hex colors from low->high
  };
};

export const GIBS_BASE_URL =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

export const BASE_LAYERS = {
  BlueMarble: {
    id: "BlueMarble",
    title: "Blue Marble",
    layer: "BlueMarble_ShadedRelief_Bathymetry",
    tileMatrixSet: "GoogleMapsCompatible" as const,
    format: "jpg" as const,
    sourceUrl:
      "https://worldview.earthdata.nasa.gov/layers/BlueMarble_ShadedRelief_Bathymetry",
    legend: { min: 0, max: 0, unit: "", gradient: [] },
  },
};

export const GIBS_DATASETS: GibsDataset[] = [
  {
    id: "modis_aqua_chla",
    title: "MODIS Aqua Chlorophyll‑a",
    layer: "MODIS_Aqua_Chlorophyll_A",
    tileMatrixSet: "GoogleMapsCompatible",
    format: "png",
    sourceUrl:
      "https://worldview.earthdata.nasa.gov/layers/MODIS_Aqua_Chlorophyll_A",
    legend: {
      min: 0.01,
      max: 20,
      unit: "mg/m^3",
      gradient: ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"],
    },
  },
  {
    id: "viirs_snpp_chla",
    title: "VIIRS SNPP Chlorophyll‑a",
    layer: "VIIRS_SNPP_Chlorophyll_A",
    tileMatrixSet: "GoogleMapsCompatible",
    format: "png",
    sourceUrl:
      "https://worldview.earthdata.nasa.gov/layers/VIIRS_SNPP_Chlorophyll_A",
    legend: {
      min: 0.01,
      max: 20,
      unit: "mg/m^3",
      gradient: ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"],
    },
  },
  {
    id: "viirs_noaa20_chla",
    title: "VIIRS NOAA‑20 Chlorophyll‑a",
    layer: "VIIRS_NOAA20_Chlorophyll_A",
    tileMatrixSet: "GoogleMapsCompatible",
    format: "png",
    sourceUrl:
      "https://worldview.earthdata.nasa.gov/layers/VIIRS_NOAA20_Chlorophyll_A",
    legend: {
      min: 0.01,
      max: 20,
      unit: "mg/m^3",
      gradient: ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"],
    },
  },
  {
    id: "modis_aqua_flh",
    title: "MODIS Aqua FLH",
    layer: "MODIS_Aqua_FLH",
    tileMatrixSet: "GoogleMapsCompatible",
    format: "png",
    sourceUrl: "https://worldview.earthdata.nasa.gov/layers/MODIS_Aqua_FLH",
    legend: {
      min: -0.01,
      max: 0.1,
      unit: "W/m^2/μm/sr",
      gradient: ["#0b1026", "#232b63", "#0ea5e9", "#22c55e", "#eab308", "#ef4444"],
    },
  },
];

export function urlTemplateFor(layer: string, matrix: GibsDataset["tileMatrixSet"], format: GibsDataset["format"]) {
  // EPSG:3857 GoogleMapsCompatible mapping: z->TileMatrix, y->TileRow, x->TileCol
  return `${GIBS_BASE_URL}/${layer}/default/{Time}/${matrix}/{z}/{y}/{x}.${format}`;
}

export function createGibsProvider(params: {
  layer: string;
  tileMatrixSet: GibsDataset["tileMatrixSet"];
  format: GibsDataset["format"];
  dateRef: { current: string };
}): Cesium.UrlTemplateImageryProvider {
  const tilingScheme = new Cesium.WebMercatorTilingScheme();
  return new Cesium.UrlTemplateImageryProvider({
    url: urlTemplateFor(params.layer, params.tileMatrixSet, params.format),
    tilingScheme,
    tileWidth: 256,
    tileHeight: 256,
    maximumLevel: 8,
    credit: new Cesium.Credit("NASA GIBS"),
    customTags: {
      Time: () => params.dateRef.current,
    },
  });
}
