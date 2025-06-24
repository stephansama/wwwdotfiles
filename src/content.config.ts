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
	brewfile(input) {
		const lines = input.split("\n").filter(Boolean);

		return lines.reduce(
			(prev, curr) => {
				// filter out comments
				if (curr.startsWith("#")) return { ...prev };

				const key = curr.startsWith("brew")
					? "brew"
					: curr.startsWith("cask")
						? "cask"
						: "unknown";

				if (key === "unknown") {
					return (console.error("unknown line ", curr), { ...prev });
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
