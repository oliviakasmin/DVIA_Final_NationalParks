import "../style.css";
import * as d3 from "d3";
import {} from "../data_utils.js";

const svgWidth = 1400;

const margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20,
};

const plantChartDiv = d3.select("#plant_biodiversity_trees");

//create div with chart for each park
//pass posX, posY and park data

const createPlantBiodiversityTrees = (posX, posY, parkData) => {
	const plantDiv = d3.append("div"); //add id here based on park?
};
