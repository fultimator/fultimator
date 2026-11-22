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

- Developer Discord: [Fultimator](https://discord.gg/aNEgvHm3Re) - `#development` channel
- Discord: [Rooster Games](https://discord.gg/ZSjM6yFUPx) - `#bot-and-tool-discussion` channel
- Discord: [Official Fabula Ultima TTJRPG Discord]- `vtt-discussion` channel

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

## Android

The Android app wraps the web build with [Capacitor](https://capacitorjs.com/).

**Requirements:** JDK 21, Android SDK (platform `android-36`, build-tools `36.0.0`), `adb`, and a `.env` with the `VITE_FIREBASE_*` values.

```bash
npm run android:build   # build the debug APK
npm run android:run     # build and install on the connected device
```

The APK ends up in `android/app/build/outputs/apk/debug/`.

### Troubleshooting

- _Java home is invalid:_ `android/gradle.properties` pins a Debian/Ubuntu JDK path. Override it in `~/.gradle/gradle.properties` with `org.gradle.java.home=/path/to/jdk-21`.
- _`INSTALL_FAILED_UPDATE_INCOMPATIBLE`:_ the installed app uses a different signing key. Run `adb uninstall com.fultimator.app` first.

### Google sign-in

Sign-in only works if the APK's signing key is registered in Firebase. Local builds use your machine's debug key, so if you need sign-in, send your SHA-1 to a maintainer in `#development`:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep SHA1
```

### Release signing (maintainers)

CI signs APKs with the release keystore from these repository secrets: `ANDROID_KEYSTORE_BASE64` (the `.jks`, base64-encoded), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD`. Pull requests from forks don't get secrets, so their APKs use a temporary key and sign-in won't work.

To sign locally with the release key, set the same values as environment variables, with `ANDROID_KEYSTORE_PATH` pointing to the `.jks` file instead of the base64 secret.

Never commit the keystore or its password. If they're lost, create a new keystore, update the four secrets, and replace the fingerprints in Firebase.

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
