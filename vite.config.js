import { defineConfig } from "vite";

export default defineConfig({
	base: process.env.CI ? "/DVIA_Final_NationalParks/" : "/",
	build: {
		target: "esnext", //browsers can handle the latest ES features
	},
	esbuild: {
		supported: {
			"top-level-await": true, //browsers can handle top-level-await features
		},
	},
});
