# Enabling the Interactive Map

The full interactive map with route polylines requires native modules from `react-native-maps`, which aren't available in Expo Go.

## Option 1: Use Development Build (Recommended for Full Features)

Create a custom development build with native modules:

```bash
# Install EAS CLI
npm install -g eas-cli

# Create development build
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

This will give you the full map experience with:
- ✅ Route polylines color-coded by line
- ✅ Interactive stop markers
- ✅ Zoom and pan controls
- ✅ Real-time map updates

## Option 2: Use Current Simplified Version (Works in Expo Go)

The current implementation works perfectly in Expo Go and includes:
- ✅ All station data loaded from MBTA API
- ✅ Station search and selection
- ✅ Origin/destination picking
- ✅ Full transfer guidance in Plan Trip tab
- ✅ Live connections with real-time predictions
- ✅ What-if scenarios and confidence badges

The map itself is replaced with a clean station selector interface.

## Switching Back to Full Map

If you create a development build, you can restore the full map component by replacing the Map import in `app/(tabs)/index.tsx`:

```typescript
// Current (simplified):
// Uses station selectors only

// Full version (requires development build):
import { MBTAMap } from '@/components/Map/MBTAMap';
// Then use <MBTAMap> component as shown in the original implementation
```

The full `MBTAMap.tsx` component is already built and ready at:
`/Users/ehushubhamshaw/.gemini/antigravity/scratch/mbta-transit-app/components/Map/MBTAMap.tsx`

## Why This Limitation?

Expo Go is a pre-built app that can't include every possible native module. `react-native-maps` requires platform-specific code that must be compiled into your app binary. Creating a development build solves this by building a custom version of Expo Go specifically for your app.

## All Other Features Work!

The limitation only affects the visual map display. All core features still work perfectly:
- ✅ Real-time MBTA API integration
- ✅ Transfer calculations with walking times
- ✅ Confidence indicators (Likely/Risky/Unlikely)
- ✅ Live connection predictions
- ✅ What-if scenario simulator
- ✅ MBTA theme and branding
