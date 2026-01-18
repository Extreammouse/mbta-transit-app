# MBTA Transit Companion

A React Native mobile application for MBTA (Massachusetts Bay Transportation Authority) transit navigation with AR indoor navigation, real-time predictions, and transfer guidance.

## Features

- **Interactive Map**: View all MBTA stations and routes on an interactive Google Map
- **Trip Planner**: Plan transfers between stations with confidence indicators (Likely/Risky/Unlikely)
- **Live Connections**: Real-time arrival predictions for selected stations
- **AR Navigation Demo**: Augmented reality indoor navigation with step-by-step directions
- **What-If Scenarios**: Simulate delays to see how they affect your transfer
- **Offline Support**: Works without internet using cached station data

## Prerequisites

Before running the app, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: Install with `npm install -g expo-cli`
- **Xcode** (for iOS development, Mac only)
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS): Install with `sudo gem install cocoapods`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Extreammouse/mbta-transit-app.git
   cd mbta-transit-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS pods (Mac only):
   ```bash
   cd ios && pod install && cd ..
   ```

## Configuration

### Google Maps API Key (Required for Android Map)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "Maps SDK for Android"
4. Create an API key under Credentials
5. Update `app.json` with your API key:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
       }
     }
   }
   ```

Note: iOS uses Apple Maps by default and does not require a Google API key.

## Running the App

### Development Build (Recommended)

Development builds include all native modules (camera, LLM, maps):

**Android:**
```bash
npx expo run:android --device
```

**iOS:**
```bash
npx expo run:ios --device
```

Note: For iOS physical devices, you must trust the developer profile:
1. Go to Settings > General > VPN and Device Management
2. Find your developer profile
3. Tap "Trust"

### iOS Simulator

```bash
npx expo run:ios
```

### Expo Go (Limited Features)

Expo Go does not support native modules like the on-device LLM. Use for basic testing only:

```bash
npx expo start
```

Then scan the QR code with Expo Go app.

## Project Structure

```
mbta-transit-app/
├── app/                    # Expo Router screens
│   └── (tabs)/            # Tab navigation screens
│       ├── index.tsx      # Map screen
│       ├── connections.tsx # Live connections
│       ├── planner.tsx    # Trip planner
│       └── navigate.tsx   # AR navigation
├── components/            # Reusable components
│   ├── ARNavigator/       # AR navigation components
│   ├── Map/               # Map component
│   ├── ScenarioSimulator/ # What-If scenarios
│   └── TransferCard/      # Transfer information
├── src/
│   ├── services/          # API and LLM services
│   ├── hooks/             # Custom React hooks
│   ├── data/              # Demo data and station info
│   └── types/             # TypeScript type definitions
├── constants/             # App constants and colors
└── assets/                # Images and static assets
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npx expo run:android --device` | Build and run on Android device |
| `npx expo run:ios --device` | Build and run on iOS device |
| `npx expo run:ios` | Build and run on iOS simulator |
| `npx expo start` | Start Expo development server |
| `cd ios && pod install` | Install iOS native dependencies |


## Troubleshooting

### iOS: "Profile has not been explicitly trusted"

On your iOS device:
1. Go to Settings > General > VPN and Device Management
2. Find the developer profile
3. Tap "Trust"

### Android: Map not showing

1. Ensure Google Maps API key is configured in `app.json`
2. Enable "Maps SDK for Android" in Google Cloud Console
3. Rebuild the app with `npx expo run:android --device`

### LLM not working in Expo Go

The on-device LLM requires native modules. Use a development build:
```bash
npx expo run:android --device
# or
npx expo run:ios --device
```

### Network errors when offline

This is expected behavior. The app falls back to offline cached data.

## Technologies Used

- **React Native** with Expo
- **Expo Router** for navigation
- **React Native Maps** for Google/Apple Maps
- **Cactus SDK** for on-device LLM (Gemma 3 1B)
- **React Native Reanimated** for animations
- **TypeScript** for type safety
- **MBTA V3 API** for real-time transit data

## License

This project is for educational and demonstration purposes.
