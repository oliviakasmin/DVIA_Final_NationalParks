import "../style.css";
import * as d3 from "d3";
import "leaflet";
import "leaflet.markercluster";
import { parkGeojson } from "../data_utils.js";
import { createSpeciesCategoriesTreeMap } from "./speciesCategoriesTreemap.js";
import {
	plantCategoriesTreemapData,
	animalCategoriesTreemapData,
} from "../data_utils.js";

export const createMap = async () => {
	const mapElement = d3.select("#map");

	const mapParkNameElement = d3.select("#map-park-name");
	const mapDirectionText =
		"Click on a park to learn more about its biodiversity";
	mapParkNameElement.text(mapDirectionText);
	const mapParkAcresElement = d3.select("#map-acres");
	const treemapTitleElement = d3.select("#treemap_title");
	const mapInfoContainer = d3.select("#park_info");

	const animalButton = d3.select("#animals_button_treemap");
	const plantButton = d3.select("#plants_button_treemap");

	const xButton = d3.select("#park_info_x");

	// Create leaflet map
	const centerUS = [39.8283, -98.5795];
	const initialZoom = 3;
	const map = L.map(mapElement.node()).setView(centerUS, initialZoom);

	var Esri_WorldTopoMap = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
		// {
		// 	attribution:
		// 		"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
		// }
	);

	var Stadia_StamenTonerLite = L.tileLayer(
		"https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}",
		{
			minZoom: 0,
			maxZoom: 20,
			attribution:
				'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			ext: "png",
		}
	);

	var Esri_OceanBasemap = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
		{
			attribution:
				"Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri",
			maxZoom: 13,
		}
	);

	const Esri_WorldTopoMap_Low = "#dfddf6";
	const Esri_WorldTopoMap_High = "#f66006";

	const lightPurple = "#6e66d4";
	const darkPurple = "#1d1856";

	// Add tile layer to the map
	Esri_WorldTopoMap.addTo(map);
	// Stadia_StamenTonerLite.addTo(map);
	// Esri_OceanBasemap.addTo(map);

	const radius = d3.scaleSqrt(
		[0, d3.max(parkGeojson.features, (d) => d.properties.Acres)],
		[2, 20]
	);

	const maxParkColor = darkPurple;
	// "#fa06e6";
	//
	// "#06fa08";
	// "#6e66d4";
	// "#1b8e13"; green
	const leastParkColor = lightPurple;
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
				// fillColor: colorScale(speciesCount),
				// fillOpacity: 0.5,
				radius: radius(Acres),
			}
		);
		marker.on("click", () => {
			xButton.classed("hidden", false);
			mapInfoContainer.classed("park_info_open", true);
			mapInfoContainer.classed("park_info_closed", false);
			mapParkNameElement.text(parkName);
			mapParkAcresElement.text(`Acres: ${Acres}`);

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

			const animalTitle = `Total animal species: ${totalAnimals}`;
			const plantTitle = `Total plant species: ${totalPlants}`;

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
				.on("click", animalOnClick);
			plantButton
				.style("display", "block")
				.classed("plantButtonNotSelected", true)
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
	const colorLegend = L.control({ position: "topright" });
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
					Math.round(i)
			);
		}
		div.innerHTML += labels.join("<br>");
		return div;
	};
	colorLegend.addTo(map);

	// Add legend for circle sizes
	const sizeLegend = L.control({ position: "bottomleft" });
	sizeLegend.onAdd = () => {
		const div = L.DomUtil.create("div", "info_legend");
		// const legendDiv = d3.select(div);
		// legendDiv.append("strong").text("Park Acres");

		const minAcres = d3.min(parkGeojson.features, (d) => d.properties.Acres);
		const maxAcres = d3.max(parkGeojson.features, (d) => d.properties.Acres);
		const midAcres = (minAcres + maxAcres) / 2;

		const sizes = [minAcres, midAcres, maxAcres].map(radius);
		const labels = [`${minAcres}`, `${midAcres}`, `${maxAcres}`];

		const width = 400;
		const height = sizes[sizes.length - 1] * 2 + 40 + 100;

		const svg = d3
			.select(div)
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		svg
			.append("text")
			.attr("x", 50)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.style("font-weight", "bold")
			.text("Acres");

		const legendGroup = svg
			.append("g")
			.attr("transform", `translate(20, ${sizes[sizes.length - 1] * 2 + 20})`);

		legendGroup
			.selectAll("circle")
			.data(sizes)
			.enter()
			.append("circle")
			.attr("cy", (d, i) => {
				if (i == 0) {
					return d;
				} else {
					return d + sizes[i - 1] * 2 + i * 10 + 20;
				}
			})
			.attr("cx", (d, i) => 10)
			.attr("r", (d) => d)
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", 2);

		legendGroup
			.selectAll("text")
			.data(labels)
			.enter()
			.append("text")
			.attr("x", 30)
			// .attr("y", (d, i) => -sizes[sizes.length - 1] * 2 + sizes[i] * 2)
			.attr("y", (d, i) => sizes[i] + sizes[i - 1] * 2 + i * 10 + 20)
			// .attr("y", (d, i) => sizes[0] + i * 20)
			// .attr("dy", "0.35em")
			.text((d) => d);

		return div;
	};

	sizeLegend.addTo(map);
};
