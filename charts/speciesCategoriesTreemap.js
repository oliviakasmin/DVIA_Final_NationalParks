import "../style.css";
import * as d3 from "d3";
import { plantColor, animalColor } from "../design_utils";

const treeMapDivElement = d3.select("div#species-category-treemap");

export const createSpeciesCategoriesTreeMap = (data, type) => {
	treeMapDivElement.selectAll("svg").remove();

	const svgWidth = treeMapDivElement.node().clientWidth - 100;
	// const svgHeight = treeMapDivElement.node().clientHeight / 2;
	const svgHeight = 300;

	const svg = treeMapDivElement
		.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	// Ensure the data is in the correct hierarchical format
	const root = d3
		.hierarchy(data)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	// Create the treemap layout
	d3.treemap().size([svgWidth, svgHeight]).padding(1)(root);

	// Create a tooltip element
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	const purpleGradient = [
		"#dfddf6",
		"#cccaf0",
		"#948edf",
		"#6e66d4",
		"#483ec9",
		"#372fa5",
		"#2a237e",
		"#1d1856",
		"#0f0d2e",
		"#020206",
	];

	const greenGradientColors = ["#dfe3a0", "#c5cb52", "#888d2a", "#3c3e13"];

	// Create a color scale
	const colorScale = d3.scaleOrdinal(
		type === "plant" ? greenGradientColors : purpleGradient
	);

	// Append the nodes to the SVG
	const nodes = svg
		.selectAll("g")
		.data(root.leaves())
		.enter()
		.append("g")
		.attr("transform", (d) => `translate(${d.x0},${d.y0})`);

	nodes
		.append("rect")
		.attr("width", (d) => d.x1 - d.x0)
		.attr("height", (d) => d.y1 - d.y0)
		.attr("fill", (d) => colorScale(d.data.name))
		.on("mouseover", (event, d) => {
			const percent = ((d.value / root.value) * 100).toFixed(2);
			tooltip
				.style("display", "block")
				.html(
					`<strong>${d.data.name}</strong><br>Value: ${d.value}<br>Percent: ${percent}%`
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

	// Find nodes that have a value of at least 20% of the maximum value
	const largeNodes = root.leaves().filter((d) => d.value / root.value >= 0.08);

	// Append text to the largest node only
	nodes
		.filter((d) => largeNodes.includes(d))
		.append("text")
		.attr("dx", 4)
		.attr("dy", 14)
		// .text((d) => d.data.name);
		.each(function (d) {
			const words = d.data.name.split(" ");
			if (words.length === 2) {
				d3.select(this)
					.append("tspan")
					.attr("x", 0)
					.attr("dy", "1em")
					.text(words[0]);
				d3.select(this)
					.append("tspan")
					.attr("x", 4)
					.attr("dy", "1em")
					.text(words[1]);
			} else {
				d3.select(this).text(d.data.name);
			}
		});
};
