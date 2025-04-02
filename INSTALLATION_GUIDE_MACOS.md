# Fultimator Installation Guide for macOS

## Introduction
This guide will help you install Fultimator on your macOS system. Fultimator supports macOS 10.12+ and is available in two versions: **x64** for Intel-based Macs, and **arm64** for M1, M2, and newer Apple Silicon Macs.

## 1. Download the Application
Download the appropriate version of Fultimator based on your Mac’s architecture:

- **x64**: For Intel-based Macs.
- **arm64**: For M1, M2, or newer Apple Silicon Macs.

You can check your Mac's architecture by clicking the Apple logo in the top-left corner, selecting **About This Mac**, and looking at the **Chip** field:
- **Intel** = x64 version
- **Apple M1/M2** = arm64 version

## 2. Open the App
Once downloaded, follow these steps to open Fultimator:

### If the app is blocked:
1. Open **System Settings** > **Privacy & Security**.
2. Look for a message about "Fultimator" being blocked.
3. Click **"Open Anyway"** to allow the app to run.
4. Alternatively, **right-click** (or **Control+click**) on the app and select **"Open"** from the context menu.

### If the app still won't open or MacOS reports the app as "damaged":
1. Open **Terminal** (Applications > Utilities > Terminal).
2. Run the following command:
   ```
   xattr -d com.apple.quarantine /Applications/Fultimator.app
   ```
3. Press **Enter** to remove the quarantine flag and open the app.

## 3. System Requirements
- macOS 10.12 (Sierra) or later.

## Troubleshooting
If you encounter issues, feel free to reach out for support on our **[Discord Server](https://discord.gg/9yYc6R93Cd)**, in the `#support` channel.
