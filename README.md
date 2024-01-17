# Fultimator

An unofficial Fabula Ultima Tool

- Fabula Ultima: https://www.needgames.it/fabula-ultima-en/
- Fultimator: https://fabula-ultima-helper.web.app/

It contains multiple tools to manage a game of Fabula Ultima.

> Fultimator is not affiliated with Need Games, it's a product of the work of fans of the game. 

## Technologies

Fultimator is a Firebase React app, that uses Material Design.

- React: https://react.dev/
- Firebase: https://firebase.google.com/
- Material Design: https://mui.com/

## Setup

You will need to install the following:

- node v16: https://nodejs.org/en/blog/release/v16.16.0

Then you can use npm to download the dependencies locked in `package-lock.json`:

```bash
$ npm ci
```

## Run

To start the application locally you can run

```bash
$ npm run start
```

It will start a local instance on http://localhost:3000

## Deploy

The app is hosted by firebase.

To deploy you need to have firebase installed. See https://www.npmjs.com/package/firebase
You also need to have the proper permissions. See https://firebase.google.com/docs/projects/iam/permissions

```bash
$ npm run deploy
```

This command will build a production version of the app, and upload it to firebase