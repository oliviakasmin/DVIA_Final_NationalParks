import "./style.css";
import * as d3 from "d3";

import {
	//treemaps
	endangeredAnimalsTreemapData, // for treemap of endangered animals
	endangeredPlantsTreemapData, // for treemap of endangered plants
	endangeredAnimalsMap, // for treemap of endangered animals reference
	endangeredPlantsMap, // for treemap of endangered plants reference
	//plant biodiversity (trees chart)
	plantBiodervisitySorted,
	//animal biodiversity (pie charts)
	animalBiodiversitySorted,
	//geojson
	parkGeojson,
} from "./data_utils.js";

console.log(endangeredAnimalsTreemapData);
