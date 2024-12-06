import "./style.css";
import * as d3 from "d3";
import { createMap, createBarChart, createBiodiversityScatter } from "./charts";

import {
	parkTotalsStackedBar,
	endangeredSpeciesStackedBar,
	animalsStackedBar,
	plantsStackedBar,
	plantBiodervisitySorted,
	animalBiodiversitySorted,
} from "./data_utils";

// intro down arrow scroll to map
const introDownArrow = d3.select("#down_arrow-intro");
const mapSection = document.getElementById("map-section");
introDownArrow.on("click", () => {
	mapSection.scrollIntoView({ behavior: "smooth" });
});

// down arrow from map to scroll to scatter chart
const mapDownArrowButton = d3.select("#down_arrow");
const scatterChartSection = document.getElementById("native-scattter-section");
mapDownArrowButton.on("click", () => {
	scatterChartSection.scrollIntoView({ behavior: "smooth" });
});

const scatterDownArrowButton = d3.select("#down_arrow_scatter");
const barChartSection = document.getElementById("bar-section");
scatterDownArrowButton.on("click", () => {
	barChartSection.scrollIntoView({ behavior: "smooth" });
});

// add functionality to plant/animal buttons

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
	} else if (dataValue === "animals") {
		barChartData = animalsStackedBar;
	} else if (dataValue === "plants") {
		barChartData = plantsStackedBar;
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
