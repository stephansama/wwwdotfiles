---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
hero:
    name: "Dotfiles"
    text: "for @stephansama"
    tagline: Open Source. Well Built. Ready to Ship.
    image:
        src: https://www.github.com/stephansama.png
        alt: Hero Image
    actions:
        - theme: brand
          text: Configs
          link: /configs
        - theme: alt
          text: GitHub
          link: https://github.com/stephansama/stephansama
features:
    - title: Neovim
      details: Use a single package or combine them—each is lightweight, independent, and plays well with others.
      link: /configs/neovim.md
      icon:
          src: https://api.iconify.design/devicon:neovim.svg
          alt: puzzle piece
    - title: TMUX
      details: Clean APIs, thorough documentation, and thoughtful defaults mean you can start building right away.
      link: /configs/tmux.md
      icon:
          light: "https://api.iconify.design/vscode-icons:file-type-light-tmux.svg"
          dark: "https://api.iconify.design/vscode-icons:file-type-tmux.svg"
          alt: Tmux developer
    - title: Homebrew
      details: Transparent code, frequent updates, and a welcoming environment for contributions.
      link: /configs/brewfile.md
      icon:
          src: https://api.iconify.design/devicon:homebrew.svg
          alt: Homebrew
    - title: Terminal
      details: Transparent code, frequent updates, and a welcoming environment for contributions.
      link: /configs/zsh.md
      icon:
          src: https://api.iconify.design/devicon:ohmyzsh.svg
          alt: Open source software
---
