import "./style.css";
import * as d3 from "d3";
import {
	createAnimalBiodiversityCircles,
	createMap,
	createBarChart,
} from "./charts";

import { parkTotalsStackedBar } from "./data_utils";

// down arrows scroll to biodiversity charts
const downArrowButton = d3.select("#down_arrow");
const biodiversityDivElement = document.getElementById("biodiversity-charts"); // Replace 'yourDivId' with the actual ID of your div
const yCoordinateBiodiversity =
	biodiversityDivElement.getBoundingClientRect().top;
downArrowButton.on("click", () => {
	window.scrollBy({
		top: yCoordinateBiodiversity,
		behavior: "smooth",
	});
});

// add functionality to plant/animal biodiversity buttons

const plantBiodiversityChart = d3.select("#plant_biodiversity_trees");
const animalBiodiversityChart = d3.select("#animal_biodiversity_circles");
animalBiodiversityChart.style("display", "none"); // hide animal chart by default

const onClickPlantsButton = () => {
	console.log("plants button clicked");
	plantBiodiversityChart.style("display", "block");
	animalBiodiversityChart.style("display", "none");
};

const onClickAnimalsButton = () => {
	console.log("animals button clicked");
	animalBiodiversityChart.style("display", "block");
	plantBiodiversityChart.style("display", "none");
};

const plantsButton = d3.select("#plants_button");
plantsButton.on("click", onClickPlantsButton);

const animalsButton = d3.select("#animals_button");
animalsButton.on("click", onClickAnimalsButton);

// add functionality to bar chart dropdowns
let barChartData = parkTotalsStackedBar;

const dataDropdown = d3.select("#bar-chart-select");
const sortDropdown = d3.select("#bar-chart-sort");

sortDropdown.on("change", function () {
	const sortValue = d3.select(this).property("value");
	if (sortValue === "park") {
		barChartData.sort((a, b) => d3.ascending(a.park, b.park));
	} else {
		barChartData.sort((a, b) => b.total - a.total);
	}
	createBarChart(barChartData);
});

// draw charts
await createMap();
createAnimalBiodiversityCircles();

createBarChart(barChartData);
