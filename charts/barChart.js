import "../style.css";
import * as d3 from "d3";

import {
	palette,
	parkNameDisplay,
	formatNumberWithCommas,
} from "../design_utils";

const barChartDiv = d3.select("#bar-chart");
const svgWidth = barChartDiv.node().clientWidth;
const svgHeight = barChartDiv.node().clientHeight;

const margin = {
	top: 100,
	right: 20,
	bottom: 160,
	left: 100,
};

const svg = barChartDiv
	.append("svg")
	.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
	.attr("width", svgWidth)
	.attr("height", svgHeight);

export const createBarChart = (data) => {
	svg.selectAll("*").remove();

	const axesLayer = svg.append("g").attr("class", "axes");
	const barsLayer = svg.append("g").attr("class", "bars");

	const categories = data[0].categories;

	const colorScale = d3.scaleOrdinal().domain(categories).range(palette);

	const stackedData = d3.stack().keys(categories)(data);

	const xScale = d3
		.scaleBand()
		.domain(data.map((d) => d.park))
		.range([0 + margin.left, svgWidth - margin.right])
		.paddingInner(0.25) // between bars
		.paddingOuter(0.1); // between first and last bar and the edges of the svg

	const [minY, maxY] = d3.extent(data.map((d) => d.total));

	const yScale = d3
		.scaleLinear()
		.domain([maxY, 0]) //reverse the domain so that the bars grow from the bottom up
		.range([margin.top, svgHeight - margin.bottom])
		.nice(); //nice() rounds the domain to make it look better

	// Append the axes
	axesLayer.append("g").attr("transform", `translate(${margin.left} 0)`);

	axesLayer
		.append("g")
		.data(stackedData)
		.attr("transform", `translate(0 ${svgHeight - margin.bottom})`)
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("transform", "rotate(-60)")
		.style("text-anchor", "end")
		.attr("dx", "-1.5em")
		.attr("dy", "0.5em")
		.text((d) => parkNameDisplay(d));

	axesLayer
		.append("g")
		.data(stackedData)
		.attr("transform", `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(yScale));

	// Append the x-axis title
	axesLayer
		.append("text")
		.attr("class", "x-axis-title")
		.attr("text-anchor", "middle")
		.attr("x", svgWidth / 2)
		.attr("y", svgHeight - margin.bottom / 2 + 60)
		.text("Parks");

	// Append the y-axis title
	axesLayer
		.append("text")
		.attr("class", "y-axis-title")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -svgHeight / 2)
		.attr("y", margin.left / 2 - 10)
		.text("Total Species");

	// Create a tooltip element
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	barsLayer
		.selectAll("g")
		.data(stackedData)
		.enter()
		.append("g")
		.attr("fill", (d) => colorScale(d.key))
		.selectAll("rect")
		// enter a second time = loop subgroup per subgroup to add all rectangles
		.data((d) => d)
		.enter()
		.append("rect")
		.attr("x", (d) => xScale(d.data.park))
		.attr("y", (d) => yScale(d[1]))
		.attr("height", (d) => {
			// console.log(d);
			return yScale(d[0]) - yScale(d[1]);
		})
		.attr("width", xScale.bandwidth())
		.on("mouseover", (event, d) => {
			const category = d3.select(event.target.parentNode).datum().key;
			tooltip
				.style("display", "block")
				.html(
					`${d.data.park}<br>
					${category}: ${formatNumberWithCommas(d[1] - d[0])}
					`
				)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY + 10}px`);
		})
		.on("mousemove", (event) => {
			tooltip
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY + 10}px`);
		})
		.on("mouseout", () => {
			tooltip.style("display", "none");
		});

	// Add legend
	const legend = svg
		.append("g")
		.attr("transform", `translate(${svgWidth - 200}, ${margin.top - 80})`);

	categories.forEach((category, i) => {
		const legendRow = legend
			.append("g")
			.attr("transform", `translate(0, ${i * 20})`);

		legendRow
			.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", colorScale(category));

		legendRow
			.append("text")
			.attr("x", 15)
			.attr("y", 10)
			.attr("text-anchor", "start")
			.text(category);
	});
};
