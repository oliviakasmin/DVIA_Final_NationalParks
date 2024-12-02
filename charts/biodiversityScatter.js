import "../style.css";
import * as d3 from "d3";
import { plantColor, animalColor } from "../design_utils";

const chartDiv = d3.select("#scatterplot");
const svgWidth = chartDiv.node().clientWidth;
const svgHeight = chartDiv.node().clientHeight;

const margin = {
	top: 100,
	right: 100,
	bottom: 100,
	left: 100,
};

export const createBiodiversityScatter = (data, type) => {
	const fillColor = type === "plant" ? plantColor : animalColor;
	const highlightColor = type === "plant" ? animalColor : plantColor;

	chartDiv.selectAll("svg").remove();

	const svg = chartDiv
		.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	const axesLayer = svg.append("g").attr("class", "axes");
	const plotLayer = svg.append("g").attr("class", "circlePlots");

	const xScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.totalSpecies)])
		.range([margin.left, svgWidth - margin.right]);
	const yScale = d3
		.scaleLinear()
		.domain([0, 100])
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
		.text(`Total ${type === "plant" ? "Plant" : "Animal"} Species`);

	// Append y-axis label
	axesLayer
		.append("text")
		.attr("class", "y-axis-label")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -svgHeight / 2)
		.attr("y", margin.left / 2)
		.text("Percent of Species that are Native");

	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	//append the data points
	plotLayer
		.selectAll("text")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d) => xScale(d.totalSpecies))
		.attr("cy", (d) => yScale(d.percentNative * 100))
		.attr("r", 5)
		.attr("fill", fillColor)
		.on("mouseover", (event, d) => {
			//show tooltip
			tooltip
				.style("display", "block")
				.html(
					`${d.park}<br>
                    ${type === "plant" ? "Plant" : "Animal"} species: ${
						d.totalSpecies
					}<br>
                    Percent native: ${
											parseFloat(d.percentNative.toFixed(2)) * 100
										}%
                    `
				)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY + 10}px`);
			d3.select(event.target).attr("fill", highlightColor);
		})
		.on("mouseout", (event, d) => {
			//hide tooltip
			tooltip.style("display", "none");
			d3.select(event.target).attr("fill", fillColor);
		});
};
