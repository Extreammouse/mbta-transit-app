# MBTA Transit Companion App

A React Native mobile app for the Massachusetts Bay Transportation Authority (MBTA) transit system, featuring real-time predictions, interactive maps, transfer guidance, and intelligent trip planning.

![MBTA Logo](https://www.mbta.com/themes/custom/mbta_bootstrap/logo.svg)

## ✨ Features

### 🗺️ Interactive Map
- Full Boston area map with MBTA subway routes
- Color-coded route polylines (Red, Orange, Blue, Green lines)
- Tappable stop markers with station information
- Origin/destination selection with visual indicators
- Zoom controls and user location tracking

### 🚶 Transfer Guidance
- Calculate walking time between platforms using GPS coordinates
- Adjustable walking speed (Slow/Normal/Fast)
- Platform buffer time estimation (30s for stairs, escalators)
- Visual transfer instructions with animations

### 📡 Live Connection Finder
- Real-time arrival predictions from MBTA API
- Auto-refresh every 15 seconds
- Grouped by route with color coding
- Countdown timers with urgency indicators
- Pull-to-refresh support

### 🎯 Confidence Indicators
Visual badges for transfer success probability:
- **Likely** (Green) - >3 min buffer time
- **Risky** (Amber) - 1-3 min buffer time  
- **Unlikely** (Red) - <1 min buffer time

### 🧪 What-If Scenarios
- Simulate arriving late with delay slider (+0 to +15 min)
- Adjust walking speed to see impact on transfers
- Real-time confidence recalculation
- Alternative route suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (optional)

### Installation

```bash
# Clone the repository
cd mbta-transit-app

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Expo Go (scan QR code)
npm start
```

## 🔑 API Configuration

### MBTA API Key (Recommended)

Get higher rate limits (1,000 vs 20 requests/min):

1. Visit https://api-v3.mbta.com/
2. Register for a free API key
3. Add to `constants/Config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api-v3.mbta.com',
  API_KEY: 'your-api-key-here', // Add your key here
};
```

### Google Maps API Key (Android only)

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android
3. Add to `app.json`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

## 📁 Project Structure

```
mbta-transit-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Map screen
│   │   ├── planner.tsx    # Trip planner
│   │   ├── connections.tsx # Live connections
│   │   └── settings.tsx   # Settings
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # About modal
├── components/            # Reusable UI components
│   ├── Map/
│   ├── RouteCard/
│   ├── ConfidenceBadge/
│   ├── TransferCard/
│   ├── ConnectionFinder/
│   ├── StopSelector/
│   └── ScenarioSimulator/
├── src/
│   ├── services/          # API & business logic
│   ├── types/             # TypeScript definitions
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
└── constants/             # Config & theme colors
```

## 🎨 MBTA Theme

Official MBTA colors are used throughout:

- **Navy** `#1C345F` - Primary brand
- **Red Line** `#DA291C`
- **Orange Line** `#ED8B00`
- **Green Line** `#00843D`
- **Blue Line** `#003DA5`
- **Silver Line** `#7C878E`
- **Commuter Rail** `#80276C`

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based navigation
- **React Query** - Data fetching & caching
- **React Native Maps** - Map display
- **Axios** - HTTP client
- **MBTA V3 API** - Real-time transit data

## 📱 Screens

### 1. Map Tab
Interactive map with route selection and origin/destination markers

### 2. Plan Trip Tab
Transfer guidance with confidence indicators and what-if scenarios

### 3. Live Tab
Real-time connection finder with auto-refreshing predictions

### 4. Settings Tab
Walking speed preferences and app information

## 🧮 Transfer Calculation

Walking time is calculated using:

```typescript
// Haversine formula for distance
distance = calculateDistance(stop1.lat, stop1.lon, stop2.lat, stop2.lon)

// Walking time with platform buffer
walkingTime = (distance / walkingSpeed) + 30 seconds

// Confidence based on buffer
buffer = availableTime - walkingTime
confidence = 
  buffer >= 180s ? 'likely' :
  buffer >= 60s ? 'risky' : 'unlikely'
```

## 📊 API Endpoints Used

- `/routes` - Subway routes (Light Rail + Heavy Rail)
- `/stops` - Station locations and details
- `/predictions` - Real-time arrival/departure times
- `/schedules` - Scheduled times (backup)
- `/shapes` - Route polylines for map display
- `/alerts` - Service disruptions (future)
- `/vehicles` - Real-time positions (future)

## 🌐 Resources

- [MBTA Website](https://www.mbta.com/)
- [MBTA V3 API Documentation](https://www.mbta.com/developers/v3-api)
- [MBTA Developer Portal](https://api-v3.mbta.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

## ⚖️ License

This is an unofficial app built for educational purposes. All MBTA data and branding are property of the Massachusetts Bay Transportation Authority.

## 🤝 Contributing

This project was built as a demonstration. For production use:

1. Add comprehensive error handling
2. Implement route planning algorithm
3. Add offline support with caching
4. Enable push notifications
5. Add unit and integration tests
6. Optimize API calls and rate limiting

## ⚠️ Disclaimer

This app provides data from the MBTA V3 API. Accuracy is not guaranteed. Always verify important travel information on [mbta.com](https://www.mbta.com/).

---

Built with ❤️ for Boston transit riders
