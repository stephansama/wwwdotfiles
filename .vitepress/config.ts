import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig(
	withSidebar(
		{
			mpa: true,
			description:
				"Documentation on how to use the mad professor suite of utilities",
			head: [["link", { href: "/favicon.svg", rel: "icon" }]],
			ignoreDeadLinks: true,
			lastUpdated: true,
			markdown: {
				theme: { dark: "catppuccin-mocha", light: "catppuccin-latte" },
			},
			outDir: "dist",
			sitemap: { hostname: "https://files.stephansama.info" },
			themeConfig: {
				footer: {
					copyright: `Copyright © ${new Date().getFullYear()} - @stephansama`,
					message: "Released under MIT license",
				},
				nav: [
					{
						link: "https://madprofessorblog.org",
						target: "_self",
						text: "Blog",
					},
				],
				search: { options: { detailedView: true }, provider: "local" },
				socialLinks: [
					{
						icon: "bluesky",
						link: "https://bsky.app/profile/stephansama.bsky.social",
					},
					{
						icon: "linkedin",
						link: "https://www.linkedin.com/in/stephan-randle-38a30319a/",
					},
					{
						icon: "npm",
						link: "https://www.npmjs.com/~stephansama",
					},
					{
						icon: "github",
						link: "https://github.com/stephansama",
					},
				],
			},
			title: "@stephansama dotfiles",
		},
		{
			useTitleFromFileHeading: true,
		},
	),
);
