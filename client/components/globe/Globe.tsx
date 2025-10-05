import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { createGibsProvider, BASE_LAYERS, GIBS_DATASETS } from "@/lib/gibs";
import { HAB_HOTSPOTS } from "@/lib/habHotspots";

export type GlobeProps = {
  dateISO: string;
  activeDatasetIds: string[];
  showCoastlines: boolean;
  showLakes: boolean;
  showBoundaries?: boolean;
  showLabels?: boolean;
  focusCircle?: { lat: number; lon: number; kmRadius: number } | null;
  intensityPreset?: "default" | "low" | "medium" | "high";
  onClickInspect?: (info: {
    lat: number;
    lon: number;
    dateISO: string;
    datasetId: string | null;
    colorHex?: string;
  }) => void;
  onHotspotClick?: (id: string) => void;
  flyToHotspotId?: string | null;
};

export default function Globe(props: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const dateRef = useRef<string>(props.dateISO);
  const datasetLayersRef = useRef<Record<string, Cesium.ImageryLayer>>({});
  const overlayLayersRef = useRef<{ coast?: Cesium.ImageryLayer; lakes?: Cesium.ImageryLayer; features?: Cesium.ImageryLayer; labels?: Cesium.ImageryLayer }>({});
  const zoneIdsRef = useRef<string[]>([]);

  // Keep date in ref for UrlTemplate providers
  useEffect(() => {
    dateRef.current = props.dateISO;
    const v = viewerRef.current;
    if (v) v.scene.requestRender();
  }, [props.dateISO]);

  // Initialize viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      geocoder: false,
      baseLayerPicker: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      homeButton: false,
      fullscreenButton: false,
      shouldAnimate: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      creditContainer: document.createElement("div"),
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.highDynamicRange = true;
    viewer.scene.requestRenderMode = true;
    viewer.scene.maximumRenderTimeChange = Infinity;

    // Base layer
    const baseProvider = createGibsProvider({
      layer: BASE_LAYERS.BlueMarble.layer,
      tileMatrixSet: BASE_LAYERS.BlueMarble.tileMatrixSet,
      format: BASE_LAYERS.BlueMarble.format,
      dateRef,
    });
    const base = new Cesium.ImageryLayer(baseProvider, { brightness: 0.9 });
    viewer.imageryLayers.add(base);

    // Hotspots as simple color-coded dots with clustering
    const dotImage = getDotImage();
    const ds = new Cesium.CustomDataSource("dots");
    ds.clustering.enabled = true;
    ds.clustering.pixelRange = 50;
    ds.clustering.minimumClusterSize = 2;
    ds.clustering.clusterEvent.addEventListener((_clustered, cluster) => {
      if (cluster.label) {
        cluster.label.show = false;
        cluster.label.text = "";
      }
      if (cluster.billboard) {
        cluster.billboard.image = dotImage;
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        cluster.billboard.scaleByDistance = new Cesium.NearFarScalar(2.0e5, 1.0, 1.0e7, 0.4);
        cluster.billboard.scale = 0.55;
        cluster.billboard.color = Cesium.Color.WHITE.withAlpha(0.9);
      }
    });

    HAB_HOTSPOTS.forEach((hs) => {
      const pos = Cesium.Cartesian3.fromDegrees(hs.lon, hs.lat);
      const colorHex = hs.intensity === "high" ? "#22c55e" : hs.intensity === "medium" ? "#fbbf24" : "#ef4444";
      ds.entities.add({
        id: `hotspot-d-${hs.id}`,
        name: hs.name,
        position: pos,
        billboard: {
          image: dotImage,
          color: Cesium.Color.fromCssColorString(colorHex),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(2.0e5, 1.0, 1.0e7, 0.45),
          scale: 0.5,
        },
        label: {
          text: `${hs.name} • ${hs.intensity}`,
          font: "14px Inter",
          fillColor: Cesium.Color.WHITE.withAlpha(0.9),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#0b1026").withAlpha(0.7),
          pixelOffset: new Cesium.Cartesian2(12, -12),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3_000_000),
        },
      });
    });
    viewer.dataSources.add(ds);

    // Click inspect handler for dots and globe background
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const picked = viewer.scene.pick(movement.position);
      if (picked && picked.id && typeof picked.id.id === "string" && picked.id.id.startsWith("hotspot-d-")) {
        const hsId = picked.id.id.replace("hotspot-d-", "");
        props.onHotspotClick?.(hsId);
        const pos = picked.id.position.getValue(Cesium.JulianDate.now());
        const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos);
        const lat = Cesium.Math.toDegrees(carto.latitude);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        const primaryDatasetId = props.activeDatasetIds[0] ?? null;
        props.onClickInspect?.({ lat, lon, dateISO: dateRef.current, datasetId: primaryDatasetId });
        return;
      }

      const cartesian = viewer.camera.pickEllipsoid(movement.position);
      if (!cartesian) return;
      const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      const primaryDatasetId = props.activeDatasetIds[0] ?? null;
      props.onClickInspect?.({ lat, lon, dateISO: dateRef.current, datasetId: primaryDatasetId });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Manage active dataset layers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const toKeep = new Set(props.activeDatasetIds);

    Object.keys(datasetLayersRef.current).forEach((id) => {
      if (!toKeep.has(id)) {
        const lyr = datasetLayersRef.current[id];
        viewer.imageryLayers.remove(lyr, false);
        delete datasetLayersRef.current[id];
      }
    });

    props.activeDatasetIds.forEach((id) => {
      if (!datasetLayersRef.current[id]) {
        const ds = GIBS_DATASETS.find((d) => d.id === id);
        if (!ds) return;
        const provider = createGibsProvider({
          layer: ds.layer,
          tileMatrixSet: ds.tileMatrixSet,
          format: ds.format,
          dateRef,
        });
        const layer = new Cesium.ImageryLayer(provider, { alpha: 0.9 });
        applyIntensityPreset(layer, props.intensityPreset ?? "default");
        viewer.imageryLayers.add(layer);
        datasetLayersRef.current[id] = layer;
      } else {
        applyIntensityPreset(datasetLayersRef.current[id], props.intensityPreset ?? "default");
      }
    });

    viewer.scene.requestRender();
  }, [props.activeDatasetIds, props.intensityPreset]);

  // Manage overlays
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (props.showCoastlines && !overlayLayersRef.current.coast) {
      const provider = createGibsProvider({
        layer: "Coastlines",
        tileMatrixSet: "GoogleMapsCompatible",
        format: "png",
        dateRef,
      });
      const lyr = new Cesium.ImageryLayer(provider, { alpha: 0.8 });
      viewer.imageryLayers.add(lyr);
      overlayLayersRef.current.coast = lyr;
    }
    if (!props.showCoastlines && overlayLayersRef.current.coast) {
      viewer.imageryLayers.remove(overlayLayersRef.current.coast, false);
      overlayLayersRef.current.coast = undefined;
    }

    if (props.showLakes && !overlayLayersRef.current.lakes) {
      const provider = createGibsProvider({
        layer: "Lakes",
        tileMatrixSet: "GoogleMapsCompatible",
        format: "png",
        dateRef,
      });
      const lyr = new Cesium.ImageryLayer(provider, { alpha: 0.8 });
      viewer.imageryLayers.add(lyr);
      overlayLayersRef.current.lakes = lyr;
    }
    if (!props.showLakes && overlayLayersRef.current.lakes) {
      viewer.imageryLayers.remove(overlayLayersRef.current.lakes, false);
      overlayLayersRef.current.lakes = undefined;
    }

    if (props.showBoundaries && !overlayLayersRef.current.features) {
      const provider = createGibsProvider({
        layer: "Reference_Features",
        tileMatrixSet: "GoogleMapsCompatible",
        format: "png",
        dateRef,
      });
      const lyr = new Cesium.ImageryLayer(provider, { alpha: 0.7 });
      viewer.imageryLayers.add(lyr);
      overlayLayersRef.current.features = lyr;
    }
    if (!props.showBoundaries && overlayLayersRef.current.features) {
      viewer.imageryLayers.remove(overlayLayersRef.current.features, false);
      overlayLayersRef.current.features = undefined;
    }

    if (props.showLabels && !overlayLayersRef.current.labels) {
      const provider = createGibsProvider({
        layer: "Reference_Labels",
        tileMatrixSet: "GoogleMapsCompatible",
        format: "png",
        dateRef,
      });
      const lyr = new Cesium.ImageryLayer(provider, { alpha: 0.8 });
      viewer.imageryLayers.add(lyr);
      overlayLayersRef.current.labels = lyr;
    }
    if (!props.showLabels && overlayLayersRef.current.labels) {
      viewer.imageryLayers.remove(overlayLayersRef.current.labels, false);
      overlayLayersRef.current.labels = undefined;
    }

    viewer.scene.requestRender();
  }, [props.showCoastlines, props.showLakes, props.showBoundaries, props.showLabels]);

  // Fly to hotspot
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !props.flyToHotspotId) return;
    const hs = HAB_HOTSPOTS.find((h) => h.id === props.flyToHotspotId);
    if (!hs) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(hs.lon, hs.lat, 2_000_000),
      duration: 2.0,
      orientation: { pitch: -0.6 },
    });
  }, [props.flyToHotspotId]);

  // Extra zones rendering (kept as-is if provided)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    zoneIdsRef.current.forEach((id) => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    zoneIdsRef.current = [];
    if (Array.isArray((props as any).extraZones)) {
      ((props as any).extraZones as { lat: number; lon: number; kmRadius: number; intensity: "low" | "medium" | "high" }[]).forEach((z, i) => {
        const color = z.intensity === "high" ? Cesium.Color.fromCssColorString("#22c55e").withAlpha(0.35) : z.intensity === "medium" ? Cesium.Color.fromCssColorString("#fbbf24").withAlpha(0.3) : Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.25);
        const id = `zone-${i}`;
        viewer.entities.add({
          id,
          position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
          ellipse: {
            semiMajorAxis: z.kmRadius * 1000,
            semiMinorAxis: z.kmRadius * 1000,
            material: color,
            outline: true,
            outlineColor: color.withAlpha(0.8),
          },
        });
        zoneIdsRef.current.push(id);
      });
    }
    viewer.scene.requestRender();
  }, [(props as any).extraZones]);

  // Focus circle
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const prev = viewer.entities.getById("focus-circle");
    if (prev) viewer.entities.remove(prev);
    if (!props.focusCircle) return;

    const { lat, lon, kmRadius } = props.focusCircle;
    viewer.entities.add({
      id: "focus-circle",
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      ellipse: {
        semiMajorAxis: kmRadius * 1000,
        semiMinorAxis: kmRadius * 1000,
        material: Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.15),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.8),
        height: 0,
      },
    });
    viewer.scene.requestRender();
  }, [props.focusCircle]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function getDotImage() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="white"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function applyIntensityPreset(layer: Cesium.ImageryLayer, preset: "default" | "low" | "medium" | "high") {
  switch (preset) {
    case "low":
      layer.alpha = 0.6;
      layer.contrast = 1.0;
      layer.saturation = 0.8;
      layer.gamma = 1.0;
      break;
    case "medium":
      layer.alpha = 0.85;
      layer.contrast = 1.2;
      layer.saturation = 1.0;
      layer.gamma = 0.95;
      break;
    case "high":
      layer.alpha = 1.0;
      layer.contrast = 1.5;
      layer.saturation = 1.1;
      layer.gamma = 0.9;
      break;
    default:
      layer.alpha = 0.9;
      layer.contrast = 1.0;
      layer.saturation = 1.0;
      layer.gamma = 1.0;
  }
}

function sampleGibsColorHex(lat: number, lon: number, dateISO: string, datasetId: string | null): string | undefined {
  if (!datasetId) return undefined;
  const ds = GIBS_DATASETS.find((d) => d.id === datasetId);
  if (!ds) return undefined;
  const tilingScheme = new Cesium.GeographicTilingScheme();
  const level = 3;
  const carto = Cesium.Cartographic.fromDegrees(lon, lat);
  const tileXY = tilingScheme.positionToTileXY(carto, level) as any;
  if (!tileXY) return undefined;
  const x = tileXY.x;
  const y = tileXY.y;
  const url = `${"https://gibs.earthdata.nasa.gov/wmts/epsg4326/best"}/${ds.layer}/default/${dateISO}/${ds.tileMatrixSet}/${level}/${y}/${x}.${ds.format}`;
  return undefined;
}
