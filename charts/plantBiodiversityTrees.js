import "../style.css";
import * as d3 from "d3";
import { plantBiodervisitySorted, plantMinMax } from "../data_utils.js";

const svgWidth = 1400;

const margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20,
};

const canvasWidth = 200;
const canvasHeight = 200;

const plantChartDiv = d3.select("#plant_biodiversity_trees");

//create div with chart for each park

const createTreeCanvas = (divId) => {
	const tree_canvas = (p) => {
		p.setup = () => {
			p.createCanvas(canvasWidth, canvasHeight);
			p.imageMode(p.CENTER);
			p.textSize(12);
			p.background(255);
		};

		p.draw = () => {
			p.textAlign(p.CENTER, p.CENTER);
			p.text("Hello", canvasWidth / 2, canvasHeight / 2);
		};
	};
	return new p5(tree_canvas, `${divId}`);
};

export const createPlantBiodiversityTrees = () => {
	const testPark = plantBiodervisitySorted[0];
	const divId = `tree-${testPark.parkCode}`;
	const plantDiv = plantChartDiv.append("div").attr("id", divId);
	createTreeCanvas(divId);

	// console.log(plantMinMax);
};

// console.log(plantBiodervisitySorted);
// const totalPlants = [];
// const percentNative = [];
// plantBiodervisitySorted.forEach((park) => {
// 	totalPlants.push(park.totalPlants);
// 	percentNative.push(park.percentNative);
// });

// console.log(totalPlants);
// console.log(percentNative);
