import "../style.css";
import * as d3 from "d3";
import { plantBiodervisitySorted, plantMinMax } from "../data_utils.js";

const plantChartDiv = d3.select("#plant_biodiversity_trees");
const svgWidth = plantChartDiv.node().clientWidth;
const svgHeight = plantChartDiv.node().clientHeight;

const margin = {
	top: 100,
	right: 100,
	bottom: 100,
	left: 100,
};

// console.log(plantBiodervisitySorted);

export const createPlantBiodiversityScatter = () => {
	const svg = plantChartDiv
		.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	const axesLayer = svg.append("g").attr("class", "axes");
	const plotLayer = svg.append("g").attr("class", "circlePlots");

	console.log(plantMinMax);

	const xScale = d3
		.scaleLinear()
		.domain([0, d3.max(plantBiodervisitySorted, (d) => d.totalPlants)])
		.range([margin.left, svgWidth - margin.right]);
	const yScale = d3
		.scaleLinear()
		.domain([0, 1])
		.range([svgHeight - margin.bottom, margin.top]);

	//append the axes
	axesLayer
		.append("g")
		.attr("transform", `translate(0, ${svgHeight - margin.bottom})`)
		.call(d3.axisBottom(xScale));
	axesLayer
		.append("g")
		.attr("transform", `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(yScale));

	// Append x-axis label
	axesLayer
		.append("text")
		.attr("class", "x-axis-label")
		.attr("text-anchor", "middle")
		.attr("x", svgWidth / 2)
		.attr("y", svgHeight - margin.bottom / 2)
		.text("Total Plant Species");

	// Append y-axis label
	axesLayer
		.append("text")
		.attr("class", "y-axis-label")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -svgHeight / 2)
		.attr("y", margin.left / 2)
		.text("Percent of Species that are Native");

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

	//append the data points
	plotLayer
		.selectAll("circle")
		.data(plantBiodervisitySorted)
		.enter()
		.append("circle")
		.attr("cx", (d) => xScale(d.totalPlants))
		.attr("cy", (d) => yScale(d.percentNative))
		.attr("r", 5)
		.attr("fill", "steelblue")
		.on("mouseover", (event, d) => {
			//show tooltip
			tooltip
				.style("display", "block")
				.html(
					`${d.park}<br>
                    total plants: ${d.totalPlants}<br>
                    percent native: ${parseFloat(d.percentNative.toFixed(2))}
                    `
				)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY + 10}px`);
			d3.select(event.target).attr("fill", "orange");
			// console.log(event.target);
		})
		.on("mouseout", (event, d) => {
			//hide tooltip
			tooltip.style("display", "none");
			d3.select(event.target).attr("fill", "steelblue");
		});
};
