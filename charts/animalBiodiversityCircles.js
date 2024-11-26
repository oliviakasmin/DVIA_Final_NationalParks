// https://observablehq.com/@d3/pie-chart/2
// https://d3-graph-gallery.com/graph/pie_basic.html
// https://d3-graph-gallery.com/graph/pie_annotation.html
// https://medium.com/@aleksej.gudkov/creating-a-pie-chart-with-d3-js-a-complete-guide-b69fd35268ea

import "../style.css";
import * as d3 from "d3";
import {
	animals,
	animalBiodiversitySorted as data,
	animalMinMax,
} from "../data_utils.js";

console.log(data);
const totalNative = [];
const totalAnimals = [];
data.forEach((d) => {
	totalNative.push(d.percentNative);
	totalAnimals.push(d.totalAnimals);
});

console.log(totalNative);
console.log(totalAnimals);

const animalChartDiv = d3.select("#animal_biodiversity_circles");

// const svgWidth = 1400;
const svgWidth = animalChartDiv.node().clientWidth;

const margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20,
};

const perRow = 7;
const perColumn = data.length / perRow;
const drawableWidth = svgWidth - margin.left - margin.right;
const spacePerCircle = drawableWidth / perRow;
const circleSizeMax = spacePerCircle / 2 - 10;
const circleSizeMin = circleSizeMax / 4;
const svgHeight = circleSizeMax * 2 * (perColumn + 1);

let sizeScale;
// let svg;
let color;

export const createPieChartCircle = (
	posX,
	posY,
	parkData,
	svg,
	circleRadius = undefined
) => {
	const { animalCategory, totalAnimals, park } = parkData;

	const pie = d3.pie().value((d) => d.value);
	const data_ready = pie(animalCategory);

	let radius;
	if (circleRadius) {
		radius = circleRadius;
	} else {
		radius = sizeScale(totalAnimals);
	}

	const arc = d3.arc().innerRadius(0).outerRadius(radius);

	const tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("background", "white")
		.style("border", "1px solid #ccc")
		.style("padding", "10px")
		.style("display", "none");

	const g = svg
		.append("g")
		.attr("transform", `translate(${posX}, ${posY})`)
		.on("click", () => {
			console.log(parkData);
		})
		.selectAll("path")
		.data(data_ready)
		.join("path")
		.attr("d", arc)
		.attr("fill", (d) => color(d.data.name))
		// .attr("stroke", "white")
		.style("stroke-width", "1px")
		.style("opacity", 1)
		.on("mouseover", (event, d) => {
			const percent = ((d.data.value / totalAnimals) * 100).toFixed(2);
			tooltip
				.style("display", "block")
				.html(
					`<strong>${d.data.name}</strong><br>Count: ${d.data.value}<br>Percent: ${percent}%`
				);
		})
		.on("mousemove", (event) => {
			tooltip
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY + 10}px`);
		})
		.on("mouseout", () => {
			tooltip.style("display", "none");
		});

	if (!circleRadius) {
		svg
			.append("text")
			.data(data_ready)
			.attr("x", posX)
			.attr("y", posY - radius - 10)
			.attr("text-anchor", "middle")
			.style("font-size", "10px")
			.text(
				`${park.replace(
					/ National Parks?( and Preserve)?$/,
					""
				)} (${totalAnimals})`
			);
		// .text(`${park.replace(/ National Park$/, "")} (${totalAnimals})`);
	}
};

// National Parks?( and Preserve)?$/

export const createAnimalBiodiversityCircles = () => {
	sizeScale = d3
		.scaleSqrt()
		.domain([animalMinMax.min, animalMinMax.max])
		.range([circleSizeMin, circleSizeMax]);

	const svg = animalChartDiv
		.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.attr("class", "animal-biodiversity-circles-svg")
		.attr("id", "animal-biodiversity-circles-svg");

	// set the color scale
	color = d3
		.scaleOrdinal()
		.domain(animals)
		.range(
			d3
				.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), animals.length)
				.reverse()
		);

	for (let i = 0; i < data.length; i++) {
		const col = i % perRow;
		const row = Math.floor(i / perRow);

		const posX = margin.left + circleSizeMax + spacePerCircle * col;
		const posY = (spacePerCircle * 2) / 3 + row * spacePerCircle;
		const parkData = data[i];
		createPieChartCircle(posX, posY, parkData, svg);
	}
};
