import "./style.css";
import * as d3 from "d3";
import { createAnimalBiodiversityCircles } from "./charts";

// add functionality to buttons

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

// draw charts
createAnimalBiodiversityCircles();
