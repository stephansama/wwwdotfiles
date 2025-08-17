import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { markdownTable } from "markdown-table";
import dedent from "dedent";
import toml from "@iarna/toml";

const md = dedent;
const html = dedent;

await Promise.all([
	buildZshFile(),
	buildTmuxFile(),
	buildNvimFile(),
	buildBrewFile(),
	buildAtuinFile(),
]);

async function buildAtuinFile() {
	const atuin = await fetchGitFile(
		"stephansama",
		".config/atuin/config.toml",
	);
	const options = toml.parse(atuin);
	const file = md`
	# Atuin

![preview](https://raw.githubusercontent.com/atuinsh/atuin/d3059af815130f102dd97cb1d1e5030920754105/demo.gif)

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
	# Brewfile

	## Brew programs
	${brewfileObj.brew
		?.sort((a, b) => a.localeCompare(b))
		?.map((cask) => `- [${cask}](https://formulae.brew.sh/cask/${cask})`)
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

		<script>
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
# Neovim

	${nvimGraphTemplate()}
	`;
	await fsp.writeFile(outputFilename("neovim.md"), file);
}

async function buildTmuxFile() {
	const text = await fetchGitFile("stephansama", ".tmux.conf");

	const heading = "# TMUX";

	const tmuxObj = parseTmux(text);

	const plugins = tmuxObj.set
		.filter(([_, __, target]) => target === "@plugin")
		.map(([_, __, ___, plugin]) => plugin.replace(/'/g, ""))
		.map((plugin) => `- [\`${plugin}\`](${githubUrl(plugin)})`)
		.join("\n");

	const file = md`
	${heading}

	\`tmux\` is a terminal multiplexer that lets you run, organize, and manage multiple terminal sessions from a single window. It allows you to split panes, detach and reattach to sessions, and keep long-running processes alive even after disconnecting. For anyone with a terminal-centric workflow, tmux is essential: it streamlines multitasking, preserves your environment across sessions, and turns the command line into a powerful, persistent workspace.

	## 🧩 TPM Plugins

	${plugins}

	## ⚙️ Configurations

	${markdownTable([
		["action", "flag", "target", "something else"],
		...tmuxObj.set.filter(([_, __, target]) => !target.startsWith("@")),
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
	console.log(zshrcFile);
	const zshrc = parseZsh(zshrcFile);
	const file = md`
	# ZSH

	## Aliases
	${markdownTable([
		["Shortcut", "Full expression"],
		//
		...Object.entries(zshrc.aliases).map(([key, val]) =>
			[key, val].map(wrapInlineCode),
		),
	])}

	## 🧩 Plugins
	${Object.entries(zshrc.plugins)
		.map(([key, val]) => `- [${key}](${val})`)
		.join("\n")}
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
	const outputDir = path.resolve("./configs/");
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
