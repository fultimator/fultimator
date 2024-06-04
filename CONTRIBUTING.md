# Fultimator

## Introduction

An unofficial Fabula Ultima Tool

- Fabula Ultima: https://www.needgames.it/fabula-ultima-en/
- Fultimator: https://fabula-ultima-helper.web.app/

It contains multiple tools to manage a game of Fabula Ultima.

> Fultimator is not affiliated with Need Games, it's a product of the work of fans of the game. 

Welcome to the contribution guidelines for Fultimator! We appreciate your interest in improving our web app. Please follow the guidelines below for code and content contributions.

## Communication Channels

If you have any questions or concerns, feel free to reach out to us through the following channels:

- Developer Discord: [Fultimator](https://discord.gg/9yYc6R93Cd) - `#development` channel 
- Discord: [Rooster Games](https://discord.gg/G9qGbn2) - `#bot-and-tool-discussion` channel

## Submitting Issues

Issues reported on [GitHub](https://github.com/greg-argulla/fultimator/issues) and support channels will be reviewed. Please follow the guidelines below for different types of issues.

### Bugs

Before submitting a bug report, ensure the following:

- Bugs are reproducible, do note if the issue is due to web browser configuration or third party extensions.
- Include clear instructions on reproducing the issue and the expected vs actual outcome.

## Tooling and Setup

Fultimator uses [React](https://react.dev/) for building dynamic user interfaces, ultizes [Firebase](https://firebase.google.com/) for its backend infrastructure, and [Material UI](https://mui.com/material-ui/) for it's React component UI library.

### Branches

- **main:** The mainline branch intended for deployment to Firebase.
- **dev:** The primary development branch for most features.
- **mobile:** A development branch specifically for mobile-related features.

When opening a pull request (PR), ensure it goes into the most relevant branch.


### Prerequisite Software

- [Git](https://git-scm.com/)
- [Node v16.16.0 (LTS)](https://nodejs.org/en/blog/release/v16.16.0)
- Code editor (recommended: [Visual Studio Code](https://code.visualstudio.com/))

## Setup

Clone the repository using the following command in your terminal:

```bash
git clone https://github.com/greg-argulla/fultimator.git
```

Then, navigate to the project folder and use npm to download dependencies locked in `package-lock.json`

```bash
npm ci
```

### Building from Source

To start the application locally you can run:

```bash
npm run start
```

To create an optimized production build:

```bash
npm run build
```

This will help you visualize and test your changes locally.

## Deploy

The app is hosted by firebase.

To deploy you need to have firebase installed. 
See [firebase - npm](https://www.npmjs.com/package/firebase)

You also need to have the proper permissions. 
See [Firebase IAM permissions](https://firebase.google.com/docs/projects/iam/permissions).

```bash
$ npm run deploy
```

This command will build a production version of the app, and upload it to firebase.
