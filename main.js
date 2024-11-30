import "./style.css";
import * as d3 from "d3";
import { createMap, createBarChart, createBiodiversityScatter } from "./charts";

import {
	parkTotalsStackedBar,
	endangeredSpeciesStackedBar,
	plantBiodervisitySorted,
	animalBiodiversitySorted,
} from "./data_utils";

// down arrows scroll to biodiversity charts
const downArrowButton = d3.select("#down_arrow");
const scatterChartSection = document.getElementById("native-scattter-section");

downArrowButton.on("click", () => {
	scatterChartSection.scrollIntoView({ behavior: "smooth" });
});

// add functionality to plant/animal biodiversity buttons
const biodiversityTitle = d3.select("#biodiversity-title");

const plantsButton = d3.select("#plants_button");
const animalsButton = d3.select("#animals_button");

createBiodiversityScatter(plantBiodervisitySorted, "plant");
animalsButton
	.style("display", "block")
	.classed("animalButtonNotSelected", true)
	.classed("animalButtonSelected", false);
plantsButton
	.style("display", "block")
	.classed("plantButtonSelected", true)
	.classed("plantButtonNotSelected", false);

const onClickPlantsButton = () => {
	biodiversityTitle.text("Plant Biodiversity");
	createBiodiversityScatter(plantBiodervisitySorted, "plant");

	animalsButton
		.style("display", "block")
		.classed("animalButtonNotSelected", true)
		.classed("animalButtonSelected", false);
	plantsButton
		.style("display", "block")
		.classed("plantButtonSelected", true)
		.classed("plantButtonNotSelected", false);
};

const onClickAnimalsButton = () => {
	biodiversityTitle.text("Animal Biodiversity");
	createBiodiversityScatter(animalBiodiversitySorted, "animal");
	animalsButton
		.style("display", "block")
		.classed("animalButtonSelected", true)
		.classed("animalButtonNotSelected", false);
	plantsButton
		.style("display", "block")
		.classed("plantButtonNotSelected", true)
		.classed("plantButtonSelected", false);
};

plantsButton.on("click", onClickPlantsButton);
animalsButton.on("click", onClickAnimalsButton);

// add functionality to bar chart dropdowns
let barChartData = parkTotalsStackedBar;

const dataDropdown = d3.select("#bar-chart-select");
const sortDropdown = d3.select("#bar-chart-sort");

const sortData = (data, sortValue) => {
	if (sortValue === "park") {
		return data.sort((a, b) => d3.ascending(a.park, b.park));
	} else {
		return data.sort((a, b) => b.total - a.total);
	}
};

dataDropdown.on("change", function () {
	const sortValue = sortDropdown.property("value");

	const dataValue = d3.select(this).property("value");
	if (dataValue === "all") {
		barChartData = parkTotalsStackedBar;
	} else if (dataValue === "endangered") {
		barChartData = endangeredSpeciesStackedBar;
	}
	barChartData = sortData(barChartData, sortValue);
	createBarChart(barChartData);
});

sortDropdown.on("change", function () {
	const sortValue = d3.select(this).property("value");
	barChartData = sortData(barChartData, sortValue);
	createBarChart(barChartData);
});

// draw charts
await createMap();

createBarChart(barChartData);
