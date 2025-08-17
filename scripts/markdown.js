import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { markdownTable } from "markdown-table";
import dedent from "dedent";
import toml from "@iarna/toml";

import content from "./markdown.json" with { type: "json" };

const md = dedent;
const html = dedent;

const outputDir = path.resolve("./configs/");

if (!fs.existsSync(outputDir)) await fsp.mkdir(path.resolve(outputDir));

await Promise.all([
	buildZshFile(),
	buildBrewFile(),
	buildNvimFile(),
	buildRootFile(),
	buildTmuxFile(),
	buildAtuinFile(),
]);

async function buildAtuinFile() {
	const atuin = await fetchGitFile(
		"stephansama",
		".config/atuin/config.toml",
	);
	const options = toml.parse(atuin);
	const file = md`
	${content.atuin.heading}

	${content.atuin.description}

	![preview](${content.atuin.previewUrl})

	## Options
	${markdownTable([
		["key", "value"],
		...Object.entries(options).map(([key, value]) => [
			`[${key}](https://docs.atuin.sh/configuration/config/#${key})`,
			wrapInlineCode(value),
		]),
	])}
	`;
	await fsp.writeFile(outputFilename("atuin.md"), file);
}

async function buildBrewFile() {
	const brewfile = await fetchGitFile("stephansama", "custom/macos/Brewfile");
	const brewfileObj = parseBrewfile(brewfile);
	const file = md`
	${content.brewfile.heading}

	${content.brewfile.description}

	## Brew programs
	${brewfileObj.brew
		?.sort((a, b) => a.localeCompare(b))
		?.map(
			(brew) =>
				`- [${brew}](https://formulae.brew.sh/formula/${brew.split("/").at(-1)})`,
		)
		.join("\n")}

	## Cask
	${brewfileObj.cask
		?.sort((a, b) => a.localeCompare(b))
		?.map((cask) => `- [${cask}](https://formulae.brew.sh/cask/${cask})`)
		.join("\n")}
	`;
	await fsp.writeFile(outputFilename("brewfile.md"), file);
}

function nvimGraphTemplate() {
	return html`
		<div id="graph"></div>

		<script client>
			import { Treemap } from "nanovis";
			import { esbuildMetafileToTree } from "nanovis/esbuild";

			let loaded = false;

			async function listener() {
				if (loaded) return;
				const bloatResponse = await fetch("/nvim.json");
				const bloatJson = await bloatResponse.json();

				const map = new Treemap(esbuildMetafileToTree(bloatJson));

				document.getElementById("graph")?.replaceWith(map.el);
				loaded = true;
			}

			listener();

			window.addEventListener("DOMContentLoaded", listener);
		</script>
	`;
}

async function buildNvimFile() {
	const file = md`
	${content.neovim.heading}

	${content.neovim.description}

	${nvimGraphTemplate()}
	`;
	await fsp.writeFile(outputFilename("neovim.md"), file);
}

async function buildRootFile() {
	const file = md`
	# Configs

	${Object.keys(content)
		.map((key) => `- [${key}](/configs/${key})`)
		.join("\n")}

	`;

	await fsp.writeFile(outputFilename("index.md"), file);
}

async function buildTmuxFile() {
	const text = await fetchGitFile("stephansama", ".tmux.conf");

	const tmuxObj = parseTmux(text);

	const plugins = tmuxObj.set
		.filter(([_, __, target]) => target === "@plugin")
		.map(([_, __, ___, plugin]) => plugin.replace(/'/g, ""))
		.map((plugin) => `- [\`${plugin}\`](${githubUrl(plugin)})`)
		.join("\n");

	const file = md`
	${content.tmux.heading}

	${content.tmux.description}

	## 🧩 TPM Plugins

	${plugins}

	## ⚙️ Configurations

	${markdownTable([
		["action", "flag", "target"],
		...tmuxObj.set
			.filter(([_, __, target]) => !target.startsWith("@"))
			.sort(([a], [b]) => a.localeCompare(b))
			.map((params) => params.slice(0, 4).map(wrapInlineCode)),
	])}

	## ⌨️ Keybindings

	${markdownTable([
		["Keybinding (`<C-b>` + )", "action", "arguments"],
		...tmuxObj.bind.map(([_, ...rest]) => rest.map(wrapInlineCode)),
	])}
	`;

	await fsp.writeFile(outputFilename("tmux.md"), file);
}

async function buildZshFile() {
	const zshrcFile = await fetchGitFile("stephansama", ".zshrc");
	const zshrc = parseZsh(zshrcFile);
	const file = md`
	${content.zsh.heading}

	${content.zsh.description}

	## 🧩 Plugins
	${Object.entries(zshrc.plugins)
		.map(([key, val]) => `- [${key}](${val})`)
		.join("\n")}

	## Aliases
	${markdownTable([
		["Shortcut", "Full expression"],
		...Object.entries(zshrc.aliases).map(([key, val]) =>
			[key, val].map(wrapInlineCode),
		),
	])}
	`;
	await fsp.writeFile(outputFilename("zsh.md"), file);
}

/**
 * @param {string} input
 * @returns {Record<'brew'|'cask', string[]>}
 */
function parseBrewfile(input) {
	const lines = input.split("\n").filter(Boolean);

	return lines.reduce((prev, curr) => {
		if (curr.startsWith("#") || !curr) return { ...prev };

		const key = curr.startsWith("brew")
			? "brew"
			: curr.startsWith("cask")
				? "cask"
				: curr.startsWith("tap")
					? "tap"
					: "unknown";

		if (key === "unknown") {
			console.error("unknown line ", curr);
			return { ...prev };
		}

		const value = /"(.*?)"/g.exec(curr)?.at(0)?.replaceAll(/"/g, "");

		const previous = prev[key] || [];
		return { ...prev, [key]: [...previous, value] };
	}, {});
}

/**
 * @param {string} input
 * @returns {Record<"plugins" | "aliases", Record<string, string>>}
 */
function parseZsh(input) {
	const lines = input.split("\n");
	let mode = undefined;
	return lines.reduce((prev, curr) => {
		if (curr.replace(/\s/g, "") === ")" || !curr) {
			mode = undefined;
			return { ...prev };
		}
		if (curr.replace(/\s/g, "").startsWith("plugins")) {
			mode = "plugins";
			return { ...prev };
		}
		if (curr === "alias \\") {
			mode = "aliases";
			return { ...prev };
		}
		if (mode === "plugins") {
			const [key, value] = curr
				.split("#")
				.map((s) => s.replace(/\s/g, ""));
			return { ...prev, [mode]: { ...prev[mode], [key]: value } };
		}
		if (mode === "aliases") {
			const [key, value, ...rest] = curr.split("=");
			return {
				...prev,
				[mode]: {
					...prev[mode],
					[key.replace(/\s/g, "")]: [value, rest]
						.join("=")
						?.replace("\\", "")
						.replace(/\ ?=$/g, "")
						.trim()
						.slice(1, -1),
				},
			};
		}
		return { ...prev };
	}, {});
}

/** @param {string} input */
function parseTmux(input) {
	const lines = input.split("\n");
	return lines.reduce((prev, curr) => {
		if (curr.startsWith("#") || !curr) return { ...prev };
		if (curr.startsWith("set")) {
			const [set, flag, action, value, ...rest] = curr.split(" ");
			return {
				...prev,
				set: [
					...(prev.set || []),
					[set, flag, action, value, rest.join(" ")].filter(Boolean),
				],
			};
		}
		if (curr.startsWith("bind")) {
			const [bind, key, action, ...value] = curr.split(" ");
			if (key === "-T") return { ...prev };
			return {
				...prev,
				bind: [
					...(prev.bind || []),
					[bind, key, action, value.join(" ")].filter(Boolean),
				],
			};
		}
		return { ...prev };
	}, {});
}

function outputFilename(filename) {
	return path.resolve(outputDir, filename);
}

function githubUrl(repo) {
	return `https://github.com/${repo}`;
}

function githubCdnUrl(repo, path) {
	return `https://raw.githubusercontent.com/stephansama/${repo}/refs/heads/main/${path}`;
}

async function fetchGitFile(repo, path) {
	const url = githubCdnUrl(repo, path);
	const res = await fetch(url);
	return await res.text();
}

function wrapInlineCode(str) {
	return `\`${str}\``;
}
