// MBTA API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://api-v3.mbta.com',
    // API Key is optional but recommended for higher rate limits
    // Get your free key at: https://api-v3.mbta.com/
    API_KEY: '', // Add your API key here

    // Rate limits
    RATE_LIMIT_WITH_KEY: 1000, // requests per minute
    RATE_LIMIT_WITHOUT_KEY: 20, // requests per minute

    // Refresh intervals (in milliseconds)
    PREDICTIONS_REFRESH: 15000, // 15 seconds
    ALERTS_REFRESH: 60000, // 1 minute
    VEHICLES_REFRESH: 5000, // 5 seconds
};

// Boston area coordinates for map centering
export const BOSTON_REGION = {
    latitude: 42.3601,
    longitude: -71.0589,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
};

// Walking speed presets (meters per second)
export const WALKING_SPEEDS = {
    slow: 0.8,    // ~1.8 mph - elderly, mobility impaired
    normal: 1.2,  // ~2.7 mph - average walking
    fast: 1.6,    // ~3.6 mph - brisk walking
};

// Confidence thresholds (in seconds)
export const CONFIDENCE_THRESHOLDS = {
    likely: 180,    // > 3 minutes buffer
    risky: 60,      // 1-3 minutes buffer
    // < 1 minute = unlikely
};

// MBTA Route Types
export const ROUTE_TYPES = {
    LIGHT_RAIL: 0,     // Green Line
    HEAVY_RAIL: 1,     // Red, Orange, Blue Lines
    COMMUTER_RAIL: 2,  // Purple line
    BUS: 3,
    FERRY: 4,
};

// App constants
export const APP_NAME = 'MBTA Transit';
export const APP_VERSION = '1.0.0';
