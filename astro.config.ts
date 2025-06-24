import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

type PluginOption = NonNullable<
	Parameters<typeof defineConfig>["0"]["vite"]
>["plugins"];

// https://astro.build/config
export default defineConfig({
	output: "static",
	integrations: [icon()],
	vite: {
		plugins: [tailwindcss() as PluginOption],
	},
});
