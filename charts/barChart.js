import "../style.css";
import * as d3 from "d3";

const barChartDiv = d3.select("#bar-chart");
const svgWidth = barChartDiv.node().clientWidth;
const svgHeight = barChartDiv.node().clientHeight;

const margin = {
	top: 20,
	right: 20,
	bottom: 200,
	left: 40,
};

const svg = barChartDiv
	.append("svg")
	.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
	.attr("width", svgWidth)
	.attr("height", svgHeight);

export const createBarChart = (data) => {
	// console.log("bar chart data", data);

	svg.selectAll("*").remove();

	const axesLayer = svg.append("g").attr("class", "axes");
	const barsLayer = svg.append("g").attr("class", "bars");

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
	axesLayer
		.append("g")
		.attr("transform", `translate(${margin.left} 0)`) //move the axis to the right by margin.left so it renders inside the svg canvas
		.call(d3.axisLeft(yScale));

	axesLayer
		.append("g")
		.attr("transform", `translate(0 ${svgHeight - margin.bottom})`)
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "end")
		.attr("dx", "-0.5em")
		.attr("dy", "-0.5em");

	const categories = ["totalPlants", "totalAnimals"];

	const colorScale = d3.scaleOrdinal().domain(categories).range([
		"#888d2a", //green
		"#6e66d4", //purple
	]);

	const stackedData = d3.stack().keys(categories)(data);

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
		.attr("height", (d) => yScale(d[0]) - yScale(d[1]))
		.attr("width", xScale.bandwidth());

	// Add legend
	const legend = svg
		.append("g")
		.attr("transform", `translate(${svgWidth - 150}, ${margin.top})`);

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
