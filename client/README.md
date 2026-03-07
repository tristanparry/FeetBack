# FeetBack Mobile App

This repository is used for the FeetBack mobile application, built for cross-platform support.

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install the development build on your local device, if not already installed (i.e., if `android`/`ios` directories not in your local repository), or if there are any changes to `app.json`/`eas.json`:

   ```bash
   npx expo prebuild
   npm run build:dev
   ```

   If the build request fails, try updating the `eas-cli` version:

   ```bash
   npm install -g eas-cli
   ```

   And updating this new version in `eas.json`.

3. Run the development build on your local device:

   ```bash
   npm run dev
   ```

   NOTE: if running the development build on a public network, you may need to use USB debugging on an Android device to connect to the Expo instance:

   ```bash
   adb reverse tcp:8081 tcp:8081
   npm run dev
   ```

   This requires you to have [Android Debug Bridge (ADB)](https://developer.android.com/tools/adb) installed on your PC via [SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools).

   NOTE: when done running with USB tethering, remove the ADB setup:

   ```bash
   adb reverse --remove-all
   ```

4. On repository save, the local instance of your running development build will auto-update!
