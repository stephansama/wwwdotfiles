#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";

const home = os.homedir();

const bloat = fs.readFileSync(`${home}/nvim-bloat-analysis.json`, {
	encoding: "utf8",
});

const bloatJson = JSON.parse(bloat);

fs.writeFileSync("./public/nvim.json", JSON.stringify(removePrefix(bloatJson)));

function removePrefix(obj) {
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value !== "object") continue;
		delete obj[key];
		const newKey = key.replace(/^.*\.local\/share\/nvim/g, "");
		obj[newKey] = removePrefix(value);
	}
	return obj;
}
