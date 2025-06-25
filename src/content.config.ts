import type { Loader, LoaderContext } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import toml from "toml";

const url = (repo: string, path: string) =>
	`https://raw.githubusercontent.com/stephansama/${repo}/refs/heads/main/${path}`;

const urls = {
	atuin: url("stephansama", ".config/atuin/config.toml"),
	brewfile: url("stephansama", "custom/macos/Brewfile"),
	readme: url("stephansama", "README.md"),
	tmux: url("stephansama", ".tmux.conf"), // TODO: parse plugins, options and keymaps
	wezterm: url("wezterm", "wezterm.lua"), // TODO: parse wezterm options
	yaziPackageToml: url("yazi", "package.toml"),
	zsh: url("stephansama", ".zshrc"), // TODO: parse plugins and aliases
};

const parsers: Partial<
	Record<keyof typeof urls, (input: string) => Record<string, unknown>>
> = {
	atuin(input) {
		const parsed = toml.parse(input);
		return {
			options: parsed,
		};
	},
	tmux(input) {
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
	},
	zsh(input) {
		const lines = input.split("\n");
		let mode: undefined | "plugins" | "aliases" = undefined;
		return lines.reduce(
			(prev, curr) => {
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
					const [key, value] = curr.split("#").map((s) => s.replace(/\s/g, ""));
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
			},
			{} as Record<"plugins" | "aliases", Record<string, string>>,
		);
	},
	brewfile(input) {
		const lines = input.split("\n").filter(Boolean);

		return lines.reduce(
			(prev, curr) => {
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
			},
			{} as Record<"brew" | "cask" | "unknown", string[] | undefined>,
		);
	},
	yaziPackageToml(input) {
		const parse = toml.parse(input) as Record<
			string,
			{ deps: { use: string }[] }
		>;
		return {
			plugins: Object.values(parse).flatMap((val) =>
				val.deps.map((dep) => dep.use),
			),
		};
	},
};

function configLoader(): Loader {
	return {
		name: "config-loader",
		load: async (context: LoaderContext): Promise<void> => {
			const entries = await Promise.all(
				Object.entries(urls).map(async ([id, url]) => {
					const response = await fetch(url);
					const body = await response.text();
					const parser = parsers[id as keyof typeof parsers];
					const properties = parser ? parser(body) : {};
					return { id, body, properties };
				}),
			);

			const { store, renderMarkdown } = context;

			store.clear();

			for (const entry of entries) {
				store.set({
					id: entry.id,
					data: entry.properties,
					body: entry.body,
					rendered: await renderMarkdown(entry.body),
				});
			}
		},
		schema: () => z.record(z.string(), z.unknown()).or(z.undefined()),
	};
}

const configs = defineCollection({ loader: configLoader() });

export const collections = { configs };
