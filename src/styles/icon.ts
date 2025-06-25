const iconMap = {
	"alfred": "simple-icons:alfred",
	"archlinux": "devicon:archlinux",
	"awscli": "vscode-icons:file-type-aws",
	"balenaetcher": "logos:balena",
	"cmake": "devicon:cmake",
	"expressvpn": "simple-icons:expressvpn",
	"gh": "simple-icons:github",
	"git": "devicon:git",
	"golang": "devicon:go",
	"inkscape": "devicon:inkscape",
	"insomnia": "devicon:insomnia",
	"keepassxc": "simple-icons:keepassxc",
	"lazydocker": "devicon:docker",
	"lazygit": "devicon:git",
	"macos": "simple-icons:apple",
	"megasync": "simple-icons:mega",
	"mongodb-compass": "devicon:mongodb",
	"nvm": "devicon:nodejs",
	"obs": "simple-icons:obsstudio",
	"openscad": "simple-icons:openscad",
	"pnpm": "devicon:pnpm",
	"rust": "simple-icons:rust",
	"slack": "devicon:slack",
	"sudo": "simple-icons:gnubash",
	"tmux": "simple-icons:tmux",
	"transmission": "simple-icons:transmission",
	"vi-mode": "devicon:vim",
	"visual-studio-code": "logos:visual-studio-code",
	"yubico-yubikey-manager": "simple-icons:yubico",
	"zoom": "logos:zoom-icon",
	"zsh": "devicon:ohmyzsh",
	"zsh-npm-scripts-autocomplete": "devicon:npm",
};

export function getIcon(tech: string) {
	const pulled = iconMap[tech as keyof typeof iconMap];
	if (pulled) return pulled;
	if (tech.startsWith("font")) return "vscode-icons:file-type-font";
}
