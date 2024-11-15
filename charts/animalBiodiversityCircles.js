// https://observablehq.com/@d3/pie-chart/2
// https://d3-graph-gallery.com/graph/pie_basic.html

import "../style.css";
import * as d3 from "d3";
import { animals } from "../data_utils.js";

const svgWidth = 800;
const svgHeight = 800;

const margin = {
	top: 10,
	right: 10,
	bottom: 10,
	left: 10,
};

const circleSizeMin = 50;
const circleSizeMax = 200;

let sizeScale;
let svg;
let color;

const animalChartDiv = d3.select("#animal_biodiversity_circles");

const createPieChartCircle = (pieData, total, posX, posY) => {
	const pie = d3.pie().value((d) => d.value);
	const data_ready = pie(pieData);

	const radius = sizeScale(total);
	const arc = d3.arc().innerRadius(0).outerRadius(radius);

	svg
		.append("g")
		.attr("transform", `translate(${posX}, ${posY})`)
		.selectAll("whatever")
		.data(data_ready)
		.join("path")
		.attr("d", arc)
		.attr("fill", (d) => color(d.data.name))
		// .attr("stroke", "white")
		.style("stroke-width", "1px")
		.style("opacity", 1);
	// .append("title")
	// .text((d) => d.data.name);
};

export const createAnimalBiodiversityCircles = (data, animalMinMax) => {
	sizeScale = d3
		.scaleSqrt()
		.domain([animalMinMax.min, animalMinMax.max])
		.range([circleSizeMin, circleSizeMax]);

	const testPark = data[0];

	svg = animalChartDiv
		.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.attr("class", "animal-biodiversity-circles")
		.attr("id", "animal-biodiversity-circles");

	// set the color scale
	color = d3
		.scaleOrdinal()
		.domain(animals)
		.range(
			d3
				.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), animals.length)
				.reverse()
		);

	const perRow = 4;
	const maxSpaceWidthPerCircle = svgWidth - margin.left - margin.right / perRow;
	for (let i = 0; i < 4; i++) {
		// get posX and posY here and pass it to createPieChartCircle
		// start with test for 4
	}

	createPieChartCircle(
		testPark.animalCategory,
		testPark.totalAnimals,
		svgWidth / 2,
		svgHeight / 2
	);
};
