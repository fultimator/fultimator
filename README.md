# Fultimator

An unofficial Fabula Ultima Tool

- Fabula Ultima: https://www.needgames.it/fabula-ultima-en/
- Fultimator: https://fabula-ultima-helper.web.app/

It contains multiple tools to manage a game of Fabula Ultima.

> Fultimator is not affiliated with Need Games, it's a product of the work of fans of the game. 

## Communication Channels

If you have any questions or concerns, feel free to reach out to us through the following channels:

- Discord: [Rooster Games Discord](https://discord.gg/G9qGbn2) - `#bot-and-tool-discussion` channel

## Submitting Issues

Issues reported on [GitHub](https://github.com/greg-argulla/fultimator/issues) and support channels will be reviewed. Please follow the guidelines below for different types of issues.

### Bugs

Before submitting a bug report, ensure the following:

- Bugs are reproducible, do note if the issue is due to web browser configuration or third party extensions.
- Include clear instructions on reproducing the issue and the expected vs actual outcome.

## Technologies

Fultimator is a Firebase React app, that uses Material Design.

- React: https://react.dev/
- Firebase: https://firebase.google.com/
- Material Design: https://mui.com/

## Setup

You will need to install the following:

- git (https://git-scm.com/)
- node v16: https://nodejs.org/en/blog/release/v16.16.0

Then you can use npm to download the dependencies locked in `package-lock.json`:

```bash
$ npm ci
```

### Branches

- **main:** The mainline branch intended for deployment to Firebase.
- **dev:** The primary development branch for most features.
- **mobile:** A development branch specifically for mobile-related features.

When opening a pull request (PR), ensure it goes into the most relevant branch.

## Run

To start the application locally you can run

```bash
$ npm run start
```

It will start a local instance on http://localhost:3000

To create an optimized production build:

```bash
npm run build
```

This will help you visualize and test your changes locally.

## Deploy

The app is hosted by firebase.

To deploy you need to have firebase installed. See https://www.npmjs.com/package/firebase
You also need to have the proper permissions. See https://firebase.google.com/docs/projects/iam/permissions

```bash
$ npm run deploy
```

This command will build a production version of the app, and upload it to firebase