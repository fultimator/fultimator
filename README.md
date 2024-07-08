![alt text](https://github.com/fultimator/fultimator/blob/main/public/fultimatorlogo.webp)
# Fultimator

## Introduction

An unofficial Fabula Ultima Tool

- Fabula Ultima: https://www.needgames.it/fabula-ultima-en/
- Fultimator: https://fabula-ultima-helper.web.app/

It contains multiple tools to manage a game of Fabula Ultima.

Fultimator is an independent production by the [Fultimator Dev Team](https://github.com/fultimator) and is not affiliated with Need Games or Rooster Games. Supplied game rules in the system compendium adhere to and are published under the [Fabula Ultima Third Party Tabletop License 1.0](https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf). We adhere to RoosterEma's guidelines, ensuring that the core book and its supplements remain integral to your experience. To fully utilize this system, you will need the [Fabula Ultima Core Rulebook](https://www.needgames.it/fabula-ultima-en/).

This repository's source code is subject to the terms of the [MIT License](https://github.com/fultimator/fultimator/blob/main/LICENSE.md). For further details, please refer to the [LICENSE](https://github.com/fultimator/fultimator/blob/main/LICENSE.md) file included in this repository.

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

## Project Contributors

Major thanks to the following contributors:

- Triex ([matteosuppo](https://github.com/matteosuppo))/ - The original creator of the fultimator webapp. The repository can be found here: [Fultimator](https://github.com/codeclysm/fultimator)
- [Alyx](https://github.com/greg-argulla) - For prolonging the project, providing useful features such as localization, adversary compendium and improving overall functionality of the webapp. 
- [spyrella](https://github.com/spyrella) - For ongoing updates to the system and maintainence of the project.
- [acinoroc](https://github.com/acinoroc) - Another active maintainer, lead developer of the Character Designer.

- Special thanks to the following contributors found here: [Contributors Link](https://github.com/fultimator/fultimator/graphs/contributors)
