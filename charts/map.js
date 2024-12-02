import "../style.css";
import * as d3 from "d3";
import "leaflet";
import "leaflet.markercluster";
import { createSpeciesCategoriesTreeMap } from "./speciesCategoriesTreemap.js";
import {
	parkGeojson,
	plantCategoriesTreemapData,
	animalCategoriesTreemapData,
} from "../data_utils.js";
import { formatNumberWithCommas } from "../design_utils.js";

export const createMap = async () => {
	const mapElement = d3.select("#map");

	const mapParkNameElement = d3.select("#map-park-name");
	const mapDirectionText =
		"Click on a park to learn more about its biodiversity";
	mapParkNameElement.text(mapDirectionText);
	const mapParkAcresElement = d3.select("#map-acres");
	const mapParkSpeciesElement = d3.select("#map-species");

	const treemapTitleElement = d3.select("#treemap_title");
	const mapInfoContainer = d3.select("#park_info");

	const animalButton = d3.select("#animals_button_treemap");
	const plantButton = d3.select("#plants_button_treemap");

	const xButton = d3.select("#park_info_x");

	// Create leaflet map
	const centerUS = [45, -110];
	const initialZoom = 3;
	const minZoom = initialZoom;
	const maxZoom = 10;
	const map = L.map(mapElement.node()).setView(centerUS, initialZoom);

	var Esri_WorldTopoMap = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
		{
			minZoom,
			maxZoom,
			// attribution:
			// 	"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
		}
	);

	// Add tile layer to the map
	Esri_WorldTopoMap.addTo(map);

	const radius = d3.scaleSqrt(
		[0, d3.max(parkGeojson.features, (d) => d.properties.Acres)],
		[2, 20]
	);

	const maxParkColor = "#4a1f0e";
	const leastParkColor = "#e49373";

	// Create a color scale based on relativeTotalSpecies
	const colorScale = d3
		.scaleLinear()
		.domain(d3.extent(parkGeojson.features, (d) => d.properties.speciesCount))
		.range([leastParkColor, maxParkColor])
		.interpolate(d3.interpolateRgb);

	// Create a tooltip element
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	const parkMarkers = L.layerGroup();
	let lastClickedMarker = null;

	for (const feature of parkGeojson.features) {
		const { speciesCount, Acres } = feature.properties;
		const parkName = feature.properties["Park Name"];

		const marker = L.circleMarker(
			[feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
			{
				color: colorScale(speciesCount),
				radius: radius(Acres),
			}
		);
		marker.on("click", () => {
			xButton.classed("hidden", false);
			mapInfoContainer.classed("park_info_open", true);
			mapInfoContainer.classed("park_info_closed", false);

			mapParkNameElement.text(parkName);
			mapParkAcresElement.text(`Acres: ${formatNumberWithCommas(Acres)}`);
			mapParkSpeciesElement.text(
				`Total species: ${formatNumberWithCommas(speciesCount)}`
			);

			const animalTreemapData = animalCategoriesTreemapData.get(parkName);
			createSpeciesCategoriesTreeMap(animalTreemapData, "animal");
			const plantTreemapData = plantCategoriesTreemapData.get(parkName);

			const totalAnimals = animalTreemapData.children.reduce(
				(acc, d) => acc + d.value,
				0
			);
			const totalPlants = plantTreemapData.children.reduce(
				(acc, d) => acc + d.value,
				0
			);

			const animalTitle = `Animal species: ${formatNumberWithCommas(
				totalAnimals
			)}`;
			const plantTitle = `Plant species: ${formatNumberWithCommas(
				totalPlants
			)}`;

			let treeMapTitle = animalTitle;

			const animalOnClick = () => {
				animalButton
					.style("display", "block")
					.classed("animalButtonSelected", true)
					.classed("animalButtonNotSelected", false);
				plantButton
					.style("display", "block")
					.classed("plantButtonNotSelected", true)
					.classed("plantButtonSelected", false);
				createSpeciesCategoriesTreeMap(animalTreemapData, "animal");
				treeMapTitle = animalTitle;
				treemapTitleElement.text(treeMapTitle);
			};

			const plantOnClick = () => {
				animalButton
					.style("display", "block")
					.classed("animalButtonNotSelected", true)
					.classed("animalButtonSelected", false);
				plantButton
					.style("display", "block")
					.classed("plantButtonSelected", true)
					.classed("plantButtonNotSelected", false);
				createSpeciesCategoriesTreeMap(plantTreemapData, "plant");
				treeMapTitle = plantTitle;
				treemapTitleElement.text(treeMapTitle);
			};

			treemapTitleElement.text(treeMapTitle);

			animalButton
				.style("display", "block")
				.classed("animalButtonSelected", true)
				.classed("animalButtonNotSelected", false)
				.on("click", animalOnClick);
			plantButton
				.style("display", "block")
				.classed("plantButtonNotSelected", true)
				.classed("plantButtonSelected", false)
				.on("click", plantOnClick);

			// Remove the park-selected class from the last clicked marker
			if (lastClickedMarker) {
				lastClickedMarker.getElement().classList.remove("park-selected");
			}

			// Add the park-selected class to the clicked marker
			marker.getElement().classList.add("park-selected");

			// Update the last clicked marker
			lastClickedMarker = marker;

			xButton.on("click", () => {
				xButton.classed("hidden", true);

				mapParkAcresElement.text("");
				mapParkSpeciesElement.text("");
				treemapTitleElement.text("");
				animalButton.style("display", "none");
				plantButton.style("display", "none");

				mapInfoContainer.selectAll("svg").remove();
				mapInfoContainer.classed("park_info_closed", true);
				mapInfoContainer.classed("park_info_open", false);
				mapParkNameElement.text(mapDirectionText);

				// Remove the park-selected class from the last clicked marker
				if (lastClickedMarker) {
					lastClickedMarker.getElement().classList.remove("park-selected");
				}
			});
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

	parkMarkers.addTo(map);

	// Add legend for color scale
	const colorLegend = L.control({ position: "bottomleft" });
	colorLegend.onAdd = function (map) {
		const div = L.DomUtil.create("div", "info legend");
		const grades = d3.extent(
			parkGeojson.features,
			(d) => d.properties.speciesCount
		);
		const labels = [];

		div.innerHTML += "<strong>Species Count</strong><br>";
		for (let i = grades[0]; i <= grades[1]; i += (grades[1] - grades[0]) / 4) {
			labels.push(
				'<i style="background:' +
					colorScale(i) +
					'; width: 18px; height: 18px; display: inline-block;"></i> ' +
					formatNumberWithCommas(Math.round(i))
			);
		}
		div.innerHTML += labels.join("<br>");
		return div;
	};
	colorLegend.addTo(map);

	// Add legend for circle sizes
	const sizeLegend = L.control({ position: "bottomleft" });
	sizeLegend.onAdd = function (map) {
		const div = L.DomUtil.create("div", "info legend");

		const minAcres = d3.min(parkGeojson.features, (d) => d.properties.Acres);
		const maxAcres = d3.max(parkGeojson.features, (d) => d.properties.Acres);
		const midAcres = (minAcres + maxAcres) / 2;

		const sizes = [minAcres, midAcres, maxAcres].map(radius);
		const labels = [minAcres, midAcres, maxAcres].map(
			(d) => `${Math.round(d)}`
		);

		div.innerHTML += "<strong>Acres</strong><br>";
		for (let i = 0; i < sizes.length; i++) {
			div.innerHTML +=
				'<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">' +
				'<i style="width: ' +
				sizes[i] * 2 +
				"px; height: " +
				sizes[i] * 2 +
				'px; border-radius: 50%; border: 2px solid black; margin-right: 5px;"></i> ' +
				formatNumberWithCommas(labels[i]) +
				"</div>";
		}
		return div;
	};
	sizeLegend.addTo(map);

	// reset button control
	L.Control.ResetButton = L.Control.extend({
		options: {
			position: "topleft",
		},
		onAdd: function (map) {
			const container = d3
				.create("div")
				.attr("class", "leaflet-bar leaflet-control");

			const button = container
				.append("a")
				.attr("class", "leaflet-control-button")
				.attr("role", "button")
				.style("cursor", "pointer");

			const icon = button
				.append("img")
				.attr("src", "../assets/refresh-icon.svg")
				.style("transform", "scale(0.5)");

			button.on("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				map.setView(centerUS, initialZoom);
			});

			return container.node();
		},
		onRemove: function (map) {},
	});
	const resetButton = new L.Control.ResetButton();
	resetButton.addTo(map);
};
