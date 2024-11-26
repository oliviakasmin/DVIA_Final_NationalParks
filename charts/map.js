import "../style.css";
import * as d3 from "d3";
import "leaflet";
import "leaflet.markercluster";
import { parkGeojson } from "../data_utils.js";
import { createPieChartCircle } from "./animalBiodiversityCircles.js";
import {
	// animals,
	animalBiodiversitySorted,
	// animalMinMax,
} from "../data_utils.js";

export const createMap = async () => {
	const mapElement = d3.select("#map");
	// const parkInfoElement = d3.select("#park_info");
	const mapPieChartElement = d3.select("#map-pie-chart");
	const svg = mapPieChartElement.append("svg");
	const svgWidth = mapPieChartElement.node().clientWidth - 50;

	const mapParkNameElement = d3.select("#map-park-name");
	mapParkNameElement.text("Click on a park to learn more");
	const mapParkAcresElement = d3.select("#map-acres");
	const mapPieChartTitleElement = d3.select("#map-pie-chart-title");

	// console.log(parkGeojson);

	// const parksGeoJson = await d3.json("../data/parks.geojson");

	// Create leaflet map
	const centerUS = [39.8283, -98.5795];
	const initialZoom = 3;
	const map = L.map(mapElement.node()).setView(centerUS, initialZoom);

	// Tile Layer (original)
	// const tileLayer = L.tileLayer(
	// 	"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	// 	{
	// 		attribution:
	// 			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	// 	}
	// );

	// dark terrain
	var tileLayer3 = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
		// {
		// 	attribution:
		// 		"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
		// }
	);

	var Esri_WorldTopoMap = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
		// {
		// 	attribution:
		// 		"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
		// }
	);

	const Esri_WorldTopoMap_Low = "#605b01";
	const Esri_WorldTopoMap_High = "#f66006";

	// Add tile layer to the map
	Esri_WorldTopoMap.addTo(map);

	const radius = d3.scaleSqrt(
		[0, d3.max(parkGeojson.features, (d) => d.properties.Acres)],
		[0, 20]
	);

	const maxParkColor = Esri_WorldTopoMap_High;
	// "#fa06e6";
	//
	// "#06fa08";
	// "#6e66d4";
	// "#1b8e13"; green
	const leastParkColor = Esri_WorldTopoMap_Low;
	// "#0569f7";
	//  "#ff7f38";
	// "#ffa938";
	// "#f3f9ac";
	// "#b68400"; mustard

	// Create a color scale based on relativeTotalSpecies
	const colorScale = d3
		.scaleLinear()
		.domain(d3.extent(parkGeojson.features, (d) => d.properties.speciesCount))
		.range([leastParkColor, maxParkColor])
		.interpolate(d3.interpolateRgb);

	// Create a tooltip element
	const tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("background", "white")
		// .style("border", "1px solid #ccc")
		.style("padding", "5px")
		.style("display", "none")
		.style("z-index", "1000")
		.style("border-radius", "5px");

	const parkMarkers = L.layerGroup();
	let lastClickedMarker = null;

	for (const feature of parkGeojson.features) {
		const { speciesCount, Acres } = feature.properties;
		const parkName = feature.properties["Park Name"];

		const marker = L.circleMarker(
			[feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
			{
				color: colorScale(speciesCount),
				fillColor: colorScale(speciesCount),
				fillOpacity: 0.5,
				radius: radius(Acres),
			}
		);
		marker.on("click", () => {
			const parkData = animalBiodiversitySorted.filter(
				(d) => d.park === parkName
			)[0];
			console.log(parkData);

			mapParkNameElement.text(parkName);
			mapParkAcresElement.text(`Acres: ${Acres}`);
			mapPieChartTitleElement.text(`Animal Species: ${parkData.totalAnimals}`);

			svg.selectAll("*").remove();

			svg
				.attr("viewBox", `0 0 ${svgWidth} ${svgWidth}`)
				.attr("width", svgWidth)
				.attr("height", svgWidth);

			createPieChartCircle(
				svgWidth / 2,
				svgWidth / 2,
				parkData,
				svg,
				svgWidth / 3
			);

			// Remove the park-selected class from the last clicked marker
			if (lastClickedMarker) {
				lastClickedMarker.getElement().classList.remove("park-selected");
			}

			// Add the park-selected class to the clicked marker
			marker.getElement().classList.add("park-selected");

			// Update the last clicked marker
			lastClickedMarker = marker;
		});
		marker.on("mouseover", (event) => {
			tooltip
				.style("display", "block")
				.text(`${parkName}`)
				.style("left", `${event.originalEvent.pageX + 10}px`)
				.style("top", `${event.originalEvent.pageY}px`);
		});
		marker.on("mouseout", () => {
			tooltip.style("display", "none");
		});

		parkMarkers.addLayer(marker);
	}

	// const parksLayer = L.geoJSON(parkGeojson, {
	// 	onEachFeature: (feature, layer) => {
	// 		layer.bindPopup(feature.properties["Park Name"]);
	// 	},
	// });

	parkMarkers.addTo(map);

	// Add legend for color scale
	const colorLegend = L.control({ position: "topright" });
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
