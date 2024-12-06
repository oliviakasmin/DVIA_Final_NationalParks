import "./style.css";
import * as d3 from "d3";

const getSpeciesData = async () => {
	try {
		return await d3.csv("data/species_edited.csv");
	} catch (err) {
		console.error("Error loading species data", err);
	}
};
const getParkData = async () => {
	try {
		return await d3.csv("data/parks.csv");
	} catch (err) {
		console.error("Error loading parks data", err);
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
const parksData = await getParkData();

const parkDataMap = d3.group(parksData, (d) => d["Park Name"]);

const getParkCode = (parkName) => {
	return parkDataMap.get(parkName)[0]["Park Code"];
};

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

// const abundanceCategories = d3.rollup(
// 	speciesData,
// 	(v) => v.length,
// 	(d) => d.Abundance
// );

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
const totalSpeciesMaxMin = { min: minSpecies, max: maxSpecies };

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
	const totalSpecies = value.length;
	const nativeDivide = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Nativeness
	);
	const totalNative = nativeDivide.get(native) || 0;
	const totalNonNative = nativeDivide.get(nonNative) || 0;
	const totalUknownNative = totalSpecies - totalNative - totalNonNative;
	const percentNative = totalNative / totalSpecies;
	const parkCode = getParkCode(key);

	const plantCategoryMap = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Category
	);

	const plantCategory = Array.from(plantCategoryMap, ([key, value]) => ({
		name: key,
		value,
	}));

	return plantBiodervisity.push({
		park: key,
		totalSpecies,
		nativeBreakdown: {
			totalNative,
			totalNonNative,
			totalUknownNative,
		},
		percentNative,
		parkCode,
		plantCategory,
	});
});

// sort plantBiodervisity by totalSpecies
const plantBiodervisitySorted = plantBiodervisity.sort(
	(a, b) => b.totalSpecies - a.totalSpecies
);

const animalsByPark = divideSpecicies.get(false);

const animalBiodiversity = [];
animalsByPark.forEach((value, key) => {
	const totalSpecies = value.length;
	const nativeDivide = d3.rollup(
		value,
		(v) => v.length,
		(d) => d.Nativeness
	);
	const totalNative = nativeDivide.get(native) || 0;
	const totalNonNative = nativeDivide.get(nonNative) || 0;
	const totalUknownNative = totalSpecies - totalNative - totalNonNative;
	const percentNative = totalNative / totalSpecies;
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
		totalSpecies,
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
	(a, b) => b.totalSpecies - a.totalSpecies
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

const parkTotalsStackedBar = [];

parksTotalSpeciesCount.forEach((total, park) => {
	const totalPlants = plantByPark.get(park).length;
	const totalAnimals = animalsByPark.get(park).length;
	parkTotalsStackedBar.push({
		park,
		total,
		"Total Plants": totalPlants,
		"Total Animals": totalAnimals,
		categories: ["Total Plants", "Total Animals"],
	});
});

const conservationStatusByPark = d3.group(
	speciesData,
	(d) => d["Park Name"],
	(d) => d["Conservation Status"]
);

const concern = "Species of Concern";
const threatened = "Threatened";
const endangered = "Endangered";
const inRecovery = "In Recovery";
const underReview = "Under Review";
const proposedThreatened = "Proposed Threatened";
const categoriesEndangered = [
	concern,
	threatened,
	endangered,
	inRecovery,
	underReview,
	proposedThreatened,
];

const endangeredSpeciesStackedBar = [];

conservationStatusByPark.forEach((value, park) => {
	const parkInfo = { park, categories: categoriesEndangered };
	let total = 0;
	value.forEach((statusValue, status) => {
		parkInfo[status] = statusValue.length;
		if (categoriesEndangered.includes(status)) {
			total += statusValue.length;
		}
	});
	parkInfo.total = total;
	const objKeys = Object.keys(parkInfo);
	const missingCategories = categoriesEndangered.filter(
		(x) => !objKeys.includes(x)
	);
	missingCategories.forEach((category) => {
		parkInfo[category] = 0;
	});
	endangeredSpeciesStackedBar.push(parkInfo);
});

const animalsStackedBar = [];
animalBiodiversitySorted.forEach((d) => {
	const parkInfo = { park: d.park, categories: animals, total: d.totalSpecies };
	d.animalCategory.forEach((category) => {
		parkInfo[category.name] = category.value;
	});

	const objKeys = Object.keys(parkInfo);
	const missingCategories = animals.filter((x) => !objKeys.includes(x));
	missingCategories.forEach((category) => {
		parkInfo[category] = 0;
	});

	animalsStackedBar.push(parkInfo);
});

const plantsStackedBar = [];
plantBiodervisitySorted.forEach((d) => {
	const parkInfo = { park: d.park, categories: plants, total: d.totalSpecies };
	d.plantCategory.forEach((category) => {
		parkInfo[category.name] = category.value;
	});

	const objKeys = Object.keys(parkInfo);
	const missingCategories = plants.filter((x) => !objKeys.includes(x));
	missingCategories.forEach((category) => {
		parkInfo[category] = 0;
	});

	plantsStackedBar.push(parkInfo);
});

// endangered species

// find all conservation status of species
// const conservationStatus = d3.group(
// 	speciesData,
// 	(d) => d["Conservation Status"]
// );

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

const plantCategoriesTreemapData = new Map();
const animalCategoriesTreemapData = new Map();

animalBiodiversitySorted.forEach((d) => {
	const treeData = {
		name: d.park,
		children: d.animalCategory.map((category) => ({
			name: category.name,
			value: category.value,
		})),
	};

	animalCategoriesTreemapData.set(d.park, treeData);
});

plantBiodervisitySorted.forEach((d) => {
	const treeData = {
		name: d.park,
		children: d.plantCategory.map((category) => ({
			name: category.name,
			value: category.value,
		})),
	};

	plantCategoriesTreemapData.set(d.park, treeData);
});

const parkAllSpeciesTreemapData = new Map();
parksData.forEach((d) => {
	const parkName = d["Park Name"];
	const treeData = {
		name: parkName,
		children: [
			{
				name: "Plants",
				children: plantCategoriesTreemapData.get(parkName).children,
			},
			{
				name: "Animals",
				children: animalCategoriesTreemapData.get(parkName).children,
			},
		],
	};
	parkAllSpeciesTreemapData.set(parkName, treeData);
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
	totalSpeciesMaxMin,
	//stacked bar chart
	parkTotalsStackedBar,
	endangeredSpeciesStackedBar,
	animalsStackedBar,
	plantsStackedBar,
	//species categories treemaps
	animalCategoriesTreemapData,
	plantCategoriesTreemapData,
	parkAllSpeciesTreemapData,
};
