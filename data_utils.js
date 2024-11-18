import "./style.css";
import * as d3 from "d3";

const getSpeciesData = async () => {
	try {
		return await d3.csv("data/species_edited.csv");
	} catch (err) {
		console.error("Error loading species data", err);
	}
};
const getParkGeojson = async () => {
	try {
		return await d3.json("data/parks.geojson");
	} catch (err) {
		console.error("Error loading park geojson", err);
	}
};

const speciesData = await getSpeciesData();
const parkGeojson = await getParkGeojson();

// find all categories of species
// const categories = d3.rollup(
// 	speciesData,
// 	(v) => v.length,
// 	(d) => d.Category
// );

const mammal = "Mammal";
const bird = "Bird";
const reptile = "Reptile";
const amphibian = "Amphibian";
const fish = "Fish";
const vascularPlant = "Vascular Plant";
const spiderScorpion = "Spider/Scorpion";
const insect = "Insect";
const invertebrate = "Invertebrate";
const fungi = "Fungi";
const nonVascularPlant = "Nonvascular Plant";
const crabLobsterShrimp = "Crab/Lobster/Shrimp";
const slugSnail = "Slug/Snail";
const algae = "Algae";

const plants = [vascularPlant, fungi, nonVascularPlant, algae];
const animals = [
	mammal,
	bird,
	reptile,
	amphibian,
	fish,
	spiderScorpion,
	insect,
	invertebrate,
	crabLobsterShrimp,
	slugSnail,
];

//  confirm all categories accounted for and either plant or animal
// categories.forEach((value, key) => {
// 	console.log(animals.includes(key) || plants.includes(key));
// });

// find all nativeness of species
// const nativeness = d3.rollup(
// 	speciesData,
// 	(v) => v.length,
// 	(d) => d.Nativeness
// );

// find all occurrence of species
const abundanceCategories = d3.rollup(
	speciesData,
	(v) => v.length,
	(d) => d.Abundance
);

// abundance by park
const abundanceByPark = d3.group(
	speciesData,
	(d) => d["Park Name"],
	(d) => d.Abundance
);

const native = "Native";
const nonNative = "Not Native";
const abundant = "Abundant";
// total species by park
const parksTotalSpeciesCount = d3.rollup(
	speciesData,
	(v) => v.length,
	(d) => d["Park Name"]
);

const [minSpecies, maxSpecies] = d3.extent(parksTotalSpeciesCount.values());

// add total species count to park geojson
parkGeojson.features.forEach((feature) => {
	const parkName = feature.properties["Park Name"];
	const speciesCount = parksTotalSpeciesCount.get(parkName);
	const relativeTotalSpecies = speciesCount / maxSpecies;
	feature.properties.speciesCount = speciesCount;
	feature.properties.relativeTotalSpecies = relativeTotalSpecies;

	//abundance
	const abundanceForPark = abundanceByPark.get(parkName);
	const abundantSpecies = [];
	abundanceForPark.forEach((value, key) => {
		if (key === abundant) {
			abundantSpecies.push(...value);
		}
	});
	const abundantAnimals = abundantSpecies.filter((d) =>
		animals.includes(d.Category)
	);
	const abundantPlants = abundantSpecies.filter((d) =>
		plants.includes(d.Category)
	);
	feature.properties.abundantAnimals = abundantAnimals;
	feature.properties.abundantPlants = abundantPlants;
});

// divide species by plant and animal
const divideSpecicies = d3.group(
	speciesData,
	(d) => plants.includes(d["Category"]), // true if plant, false if animal
	(d) => d["Park Name"]
);

const plantByPark = divideSpecicies.get(true);

const plantBiodervisity = [];

plantByPark.forEach((value, key) => {
	const totalPlants = value.length;
	const nativeDivide = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Nativeness
	);
	const totalNative = nativeDivide.get(native) || 0;
	const totalNonNative = nativeDivide.get(nonNative) || 0;
	const totalUknownNative = totalPlants - totalNative - totalNonNative;
	const percentNative = totalNative / totalPlants;

	return plantBiodervisity.push({
		park: key,
		totalPlants,
		nativeBreakdown: {
			totalNative,
			totalNonNative,
			totalUknownNative,
		},
		percentNative,
	});
});

// sort plantBiodervisity by totalPlants
const plantBiodervisitySorted = plantBiodervisity.sort(
	(a, b) => b.totalPlants - a.totalPlants
);

const animalsByPark = divideSpecicies.get(false);

const animalBiodiversity = [];
animalsByPark.forEach((value, key) => {
	const totalAnimals = value.length;
	const nativeDivide = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Nativeness
	);
	const totalNative = nativeDivide.get(native) || 0;
	const totalNonNative = nativeDivide.get(nonNative) || 0;
	const totalUknownNative = totalAnimals - totalNative - totalNonNative;
	const percentNative = totalNative / totalAnimals;
	const animalCategoryMap = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Category
	);

	const animalCategory = Array.from(animalCategoryMap, ([key, value]) => ({
		name: key,
		value,
	}));

	return animalBiodiversity.push({
		park: key,
		totalAnimals,
		nativeBreakdown: {
			totalNative,
			totalNonNative,
			totalUknownNative,
		},
		percentNative,
		animalCategory,
	});
});

// sort animalBiodiversity by totalAnimals
const animalBiodiversitySorted = animalBiodiversity.sort(
	(a, b) => b.totalAnimals - a.totalAnimals
);

const plantTotals = [];
plantByPark.values().forEach((d) => {
	plantTotals.push(d.length);
});

const animalTotals = [];
animalsByPark.values().forEach((d) => {
	animalTotals.push(d.length);
});

const [minPlants, maxPlants] = d3.extent(plantTotals);
const [minAnimals, maxAnimals] = d3.extent(animalTotals);
const plantMinMax = { min: minPlants, max: maxPlants };
const animalMinMax = { min: minAnimals, max: maxAnimals };

// endangered species

// find all conservation status of species
// const conservationStatus = d3.group(
// 	speciesData,
// 	(d) => d["Conservation Status"]
// );

const conservationStatusByPark = d3.group(
	speciesData,
	(d) => d["Park Name"],
	(d) => d["Conservation Status"]
);

const endangeredAnimalsTreemapData = {
	name: "National Parks Endangered Animal Species",
	children: [],
};

const endangeredPlantsTreemapData = {
	name: "National Parks Endangered Animal Species",
	children: [],
};

conservationStatusByPark.forEach((parkValue, parkKey) => {
	const animalChildren = [];
	const plantChildren = [];
	parkValue.forEach((value, key) => {
		//ignore all of the "" keys
		if (key.length) {
			const animalValues = value.filter((d) => animals.includes(d.Category));
			animalChildren.push({ name: key, value: animalValues.length });

			const plantValues = value.filter((d) => plants.includes(d.Category));
			plantChildren.push({ name: key, value: plantValues.length });
		}
	});

	endangeredAnimalsTreemapData.children.push({
		name: parkKey,
		children: animalChildren,
	});

	endangeredPlantsTreemapData.children.push({
		name: parkKey,
		children: plantChildren,
	});
});

const endangeredAnimalsMap = new Map();
const endangeredPlantsMap = new Map();

conservationStatusByPark.forEach((value, key) => {
	const endangeredAnimals = [];
	const endangeredPlants = [];
	value.forEach((categoryValue, categoryKey) => {
		if (categoryKey.length) {
			const animalsFiltered = categoryValue.filter((d) =>
				animals.includes(d.Category)
			);
			const plantsFiltered = categoryValue.filter((d) =>
				plants.includes(d.Category)
			);

			endangeredAnimals.push({ [categoryKey]: animalsFiltered });
			endangeredPlants.push({ [categoryKey]: plantsFiltered });
		}
	});
	endangeredAnimalsMap.set(key, endangeredAnimals);
	endangeredPlantsMap.set(key, endangeredPlants);
});

export {
	//treemaps
	endangeredAnimalsTreemapData, // for treemap of endangered animals
	endangeredPlantsTreemapData, // for treemap of endangered plants
	endangeredAnimalsMap, // for treemap of endangered animals reference
	endangeredPlantsMap, // for treemap of endangered plants reference
	//plant biodiversity (trees chart)
	plantBiodervisitySorted,
	plantMinMax,
	//animal biodiversity (pie charts)
	animalBiodiversitySorted,
	animalMinMax,
	animals,
	//geojson
	parkGeojson,
};
