import "../style.css";
import * as d3 from "d3";
import "leaflet";
import "leaflet.markercluster";
// import { parks.geojson } from "../data_utils.js";

export const createMap = async () => {
	const mapElement = d3.select("#map");

	const parksGeoJson = await d3.json("../data/parks.geojson");
	const parksLayer = L.geoJSON(parksGeoJson, {
		onEachFeature: (feature, layer) => {
			layer.bindPopup(feature.properties["Park Name"]);
		},
	});

	// Create leaflet map
	const centerUS = [39.8283, -98.5795];
	const initialZoom = 3;
	const map = L.map(mapElement.node()).setView(centerUS, initialZoom);

	// Tile Layer
	const tileLayer = L.tileLayer(
		"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}
	);

	// Add layers to map
	map.addLayer(tileLayer).addLayer(parksLayer);
};
