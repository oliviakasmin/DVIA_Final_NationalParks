export const parkNameDisplay = (name) => {
	return `${name.replace(/ National Parks?( and Preserve)?$/, "")}`;
};

export const formatNumberWithCommas = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const plantColor = "#888d2a"; //green
export const animalColor = "#6e66d4"; //purple

export const palette = [
	plantColor,
	animalColor,
	"#9AC2C9", // light blue
	"#FA7921", // orange
	"#053B06", // dark green
	"#FCFCFC", // white-ish
	"#E49273", // peach
	"#EE4266", //red
	"#06D6A0", // teal
	"#08605F", // dark blue/green
];
