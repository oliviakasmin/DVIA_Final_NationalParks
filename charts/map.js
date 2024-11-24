import "../style.css";
import * as d3 from "d3";
import "leaflet";
import "leaflet.markercluster";
import { parkGeojson } from "../data_utils.js";

export const createMap = async () => {
	const mapElement = d3.select("#map");

	console.log(parkGeojson);

	// const parksGeoJson = await d3.json("../data/parks.geojson");

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

	const tileLayer2 = L.tileLayer(
		"https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.{ext}",
		{
			// minZoom: 0,
			// maxZoom: 18,
			attribution:
				'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			ext: "png",
		}
	);

	var tileLayer3 = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
		// {
		// 	attribution:
		// 		"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
		// }
	);

	// Add tile layer to the map
	tileLayer3.addTo(map);

	const radius = d3.scaleSqrt(
		[0, d3.max(parkGeojson.features, (d) => d.properties.Acres)],
		[0, 20]
	);

	const maxParkColor = "#6e66d4";
	// "#1b8e13"; green
	const leastParkColor = "#f3f9ac";
	// "#b68400"; mustar

	// Create a color scale based on relativeTotalSpecies
	const colorScale = d3
		.scaleLinear()
		.domain(d3.extent(parkGeojson.features, (d) => d.properties.speciesCount))
		.range([leastParkColor, maxParkColor])
		.interpolate(d3.interpolateRgb);

	const parkMarkers = L.layerGroup();
	for (const feature of parkGeojson.features) {
		const { speciesCount, Acres } = feature.properties;

		const marker = L.circleMarker(
			[feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
			{
				color: colorScale(speciesCount),
				fillColor: colorScale(speciesCount),
				fillOpacity: 0.5,
				radius: radius(Acres),
			}
		);
		marker.bindPopup(
			`<p><b>${feature.properties["Park Name"]}</b></p>
			<p>Acres: ${Acres}</p>
			<p>Species: ${speciesCount}</p>`
		);
		parkMarkers.addLayer(marker);
	}

	const parksLayer = L.geoJSON(parkGeojson, {
		onEachFeature: (feature, layer) => {
			layer.bindPopup(feature.properties["Park Name"]);
		},
	});

	parkMarkers.addTo(map);

	// Add legend for color scale
	const colorLegend = L.control({ position: "bottomright" });
	colorLegend.onAdd = function (map) {
		const div = L.DomUtil.create("div", "info legend");
		const grades = d3.extent(
			parkGeojson.features,
			(d) => d.properties.speciesCount
		);
		const labels = [];

		div.innerHTML += "<strong>Species Count</strong><br>";
		for (let i = grades[0]; i <= grades[1]; i += (grades[1] - grades[0]) / 5) {
			labels.push(
				'<i style="background:' +
					colorScale(i) +
					'; width: 18px; height: 18px; display: inline-block;"></i> ' +
					Math.round(i)
			);
		}
		div.innerHTML += labels.join("<br>");
		return div;
	};
	colorLegend.addTo(map);

	// Add layers to map
	// map
	// .addLayer(tileLayer)
	// .addLayer(parksLayer)
	// .addLayer(parkMarkers);
};
