import "./style.css";
import * as d3 from "d3";
import { createAnimalBiodiversityCircles } from "./charts";
import {
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
	//geojson
	parkGeojson,
} from "./data_utils.js";

createAnimalBiodiversityCircles();
// animalBiodiversitySorted, animalMinMax
