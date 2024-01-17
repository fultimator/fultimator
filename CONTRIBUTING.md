# Contributing Guidelines for Fultimator

## Introduction

Welcome to the contribution guidelines for Fultimator! We appreciate your interest in improving our web app. Please follow the guidelines below for code and content contributions.

## Communication Channels

If you have any questions or concerns, feel free to reach out to us through the following channels:

- Discord: [Rooster Games Discord](https://discord.gg/G9qGbn2) - `#bot-and-tool-discussion` channel

## Submitting Issues

Issues reported on [GitHub](https://github.com/greg-argulla/fultimator/issues) and support channels will be reviewed. Please follow the guidelines below for different types of issues.

### Bugs

Before submitting a bug report, ensure the following:

- Bugs are reproducible, do note if the issue is due to web browser configuration or third party extensions.
- Include clear instructions on reproducing the issue and the expected vs actual outcome.

## Tooling and Setup

Fultimator uses [React](https://react.dev/) for building dynamic user interfaces, ultizes [Firebase](https://firebase.google.com/) for its backend infrastructure, and [Material UI](https://mui.com/material-ui/) for it's React component UI library.

### Branches

- **main:** Mainline branch to be deployed to Firebase
- **mobile:** A development branch for mobile related features

When opening a PR, ensure it goes into the most relevant branch.

### Prerequisite Software

- [Git](https://git-scm.com/)
- [Node.js LTS](https://nodejs.org)
- Code editor (recommended: [Visual Studio Code](https://code.visualstudio.com/))

### Setup

Clone the repository using the following command in your terminal:

```bash
git clone https://github.com/greg-argulla/fultimator.git
```

Then, navigate to the project folder and run:

```bash
npm install
```

If you get a dependency error, use the following:

```bash
npm install --force
```

### Building from Source

To create an optimized production build:

```bash
npm run build
```

To start the development server, use:

```bash
npm run start
```

This will help you visualize and test your changes locally.

To manually deploy to firebase, use:

```bash
npm run deploy
```


## Code Contributions

To contribute code, [fork the repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) and submit a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

We look forward to your contributions!
