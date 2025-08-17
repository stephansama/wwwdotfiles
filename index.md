---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
hero:
    name: "Dotfiles"
    text: "for @stephansama"
    tagline: Opinionated. Clean. Consistent.
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
      details: A highly opinionated Lua-based framework that transforms Neovim into a fast, modern editor.
      link: /configs/neovim.md
      icon:
          src: https://api.iconify.design/devicon:neovim.svg
          alt: Neovim logo
    - title: TMUX
      details: Multiplexer setup with sensible defaults, custom keybindings, and seamless session management.
      link: /configs/tmux.md
      icon:
          light: "https://api.iconify.design/vscode-icons:file-type-light-tmux.svg"
          dark: "https://api.iconify.design/vscode-icons:file-type-tmux.svg"
          alt: Tmux logo

    - title: ZSH
      details: ZSH configured with Oh My Zsh, plugins, and themes for an efficient, user-friendly shell.
      link: /configs/zsh.md
      icon:
          src: https://api.iconify.design/devicon:ohmyzsh.svg
          alt: ZSH logo

    - title: Homebrew
      details: Brewfile with essential tools and packages for macOS, making setup repeatable and fast.
      link: /configs/brewfile.md
      icon:
          src: https://api.iconify.design/devicon:homebrew.svg
          alt: Homebrew logo
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/stephansama.png',
    name: 'Actions',
    title: '@stephansama',
    links: [
      { icon: 'github', link: 'https://github.com/stephansama/actions' },
      {
        icon: {
          svg:  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><!-- Icon from Arcticons by Donnnno - https://creativecommons.org/licenses/by-sa/4.0/ --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.04 42.5c10.215 0 18.46-8.285 18.46-18.54c0-10.215-8.245-18.46-18.46-18.46C13.785 5.5 5.5 13.745 5.5 23.96c0 10.255 8.285 18.54 18.54 18.54m16.012-27.75H7.96m32.195 18.275H7.857M5.6 24h36.8M24.04 5.5v37"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.02 42.5c5.108 0 9.23-8.285 9.23-18.54c0-10.215-4.122-18.46-9.23-18.46c-5.128 0-9.27 8.245-9.27 18.46c0 10.255 4.142 18.54 9.27 18.54"/></svg>'
        },
        link: 'https://actions.stephansama.info/'
      }
    ]
  },
  {
    avatar: 'https://github.com/stephansama.png',
    name: 'Mad Professor Blog',
    title: '@stephansama',
    links: [
      {
        icon: {
          svg:  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><!-- Icon from Arcticons by Donnnno - https://creativecommons.org/licenses/by-sa/4.0/ --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.04 42.5c10.215 0 18.46-8.285 18.46-18.54c0-10.215-8.245-18.46-18.46-18.46C13.785 5.5 5.5 13.745 5.5 23.96c0 10.255 8.285 18.54 18.54 18.54m16.012-27.75H7.96m32.195 18.275H7.857M5.6 24h36.8M24.04 5.5v37"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.02 42.5c5.108 0 9.23-8.285 9.23-18.54c0-10.215-4.122-18.46-9.23-18.46c-5.128 0-9.27 8.245-9.27 18.46c0 10.255 4.142 18.54 9.27 18.54"/></svg>'
        },
        link: 'https://madprofessorblog.org'
      }
    ]
  },
  {
    avatar: 'https://github.com/stephansama.png',
    name: 'Packages',
    title: '@stephansama',
    links: [
      { icon: 'github', link: 'https://github.com/stephansama/packages' },
      {
        icon: {
          svg:  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><!-- Icon from Arcticons by Donnnno - https://creativecommons.org/licenses/by-sa/4.0/ --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.04 42.5c10.215 0 18.46-8.285 18.46-18.54c0-10.215-8.245-18.46-18.46-18.46C13.785 5.5 5.5 13.745 5.5 23.96c0 10.255 8.285 18.54 18.54 18.54m16.012-27.75H7.96m32.195 18.275H7.857M5.6 24h36.8M24.04 5.5v37"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24.02 42.5c5.108 0 9.23-8.285 9.23-18.54c0-10.215-4.122-18.46-9.23-18.46c-5.128 0-9.27 8.245-9.27 18.46c0 10.255 4.142 18.54 9.27 18.54"/></svg>'
        },
        link: 'https://packages.stephansama.info/'
      }
    ]
  },
]
</script>

<picture>
 <source srcset="https://raw.githubusercontent.com/stephansama/static/refs/heads/main/gh-banner-light.png" media="(prefers-color-scheme: light)"/>
 <source srcset="https://raw.githubusercontent.com/stephansama/static/refs/heads/main/gh-banner-dark.png" media="(prefers-color-scheme: dark)"/>
 <img src="https://raw.githubusercontent.com/stephansama/static/refs/heads/main/gh-banner-dark.png" alt="stephansama's banner" />
</picture>

<h3 align="center">Other projects</h3>

<VPTeamMembers size="small" :members="members" />
