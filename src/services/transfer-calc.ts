import { WALKING_SPEEDS, CONFIDENCE_THRESHOLDS } from '../../constants/Config';
import { Stop, TransferInfo, ConfidenceLevel, WalkingSpeed } from '../types/mbta';

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate walking time between two stops
 * @param fromStop - Origin stop
 * @param toStop - Destination stop
 * @param speed - Walking speed preset
 * @returns Walking time in seconds
 */
export function calculateWalkingTime(
    fromStop: Stop,
    toStop: Stop,
    speed: WalkingSpeed = 'normal'
): number {
    const distance = calculateDistance(
        fromStop.attributes.latitude,
        fromStop.attributes.longitude,
        toStop.attributes.latitude,
        toStop.attributes.longitude
    );

    // Add 30 seconds buffer for platform navigation, stairs, etc.
    const walkingTime = distance / WALKING_SPEEDS[speed];
    const platformBuffer = 30;

    return Math.ceil(walkingTime + platformBuffer);
}

/**
 * Calculate transfer information between two stops
 * @param fromStop - Origin stop
 * @param toStop - Destination stop
 * @param speed - Walking speed preset
 * @param availableTimeSeconds - Time available for the transfer
 * @returns Transfer information including confidence level
 */
export function calculateTransfer(
    fromStop: Stop,
    toStop: Stop,
    speed: WalkingSpeed = 'normal',
    availableTimeSeconds: number
): TransferInfo {
    const distance = calculateDistance(
        fromStop.attributes.latitude,
        fromStop.attributes.longitude,
        toStop.attributes.latitude,
        toStop.attributes.longitude
    );

    const walkingTime = calculateWalkingTime(fromStop, toStop, speed);
    const bufferSeconds = availableTimeSeconds - walkingTime;
    const confidence = calculateConfidence(bufferSeconds);

    return {
        fromStop,
        toStop,
        walkingTimeSeconds: walkingTime,
        walkingDistanceMeters: Math.round(distance),
        confidence,
        bufferSeconds,
    };
}

/**
 * Calculate confidence level based on time buffer
 * @param bufferSeconds - Time buffer in seconds (available time - walking time)
 * @returns Confidence level: 'likely', 'risky', or 'unlikely'
 */
export function calculateConfidence(bufferSeconds: number): ConfidenceLevel {
    if (bufferSeconds >= CONFIDENCE_THRESHOLDS.likely) {
        return 'likely';
    } else if (bufferSeconds >= CONFIDENCE_THRESHOLDS.risky) {
        return 'risky';
    } else {
        return 'unlikely';
    }
}

/**
 * Format walking time for display
 * @param seconds - Walking time in seconds
 * @returns Formatted string (e.g., "2 min", "30 sec")
 */
export function formatWalkingTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} sec`;
    }
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "150m", "0.3 mi")
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    // Convert to miles for larger distances
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
}

/**
 * Simulate a delay scenario and recalculate confidence
 * @param originalBuffer - Original buffer time in seconds
 * @param delaySeconds - Additional delay in seconds
 * @returns New confidence level after accounting for delay
 */
export function simulateDelay(
    originalBuffer: number,
    delaySeconds: number
): {
    newConfidence: ConfidenceLevel;
    newBuffer: number;
} {
    const newBuffer = originalBuffer - delaySeconds;
    return {
        newConfidence: calculateConfidence(newBuffer),
        newBuffer,
    };
}

/**
 * Get walking speed in human-readable format
 * @param speed - Walking speed preset
 * @returns Speed description
 */
export function getSpeedDescription(speed: WalkingSpeed): string {
    switch (speed) {
        case 'slow':
            return 'Slow (~1.8 mph)';
        case 'normal':
            return 'Normal (~2.7 mph)';
        case 'fast':
            return 'Fast (~3.6 mph)';
    }
}

/**
 * Check if a transfer is feasible
 * @param walkingTime - Required walking time in seconds
 * @param availableTime - Available time in seconds
 * @returns True if transfer is possible (even if risky)
 */
export function isTransferFeasible(
    walkingTime: number,
    availableTime: number
): boolean {
    // Allow transfers even if buffer is negative (user might run)
    // But only up to 30 seconds negative
    return availableTime - walkingTime >= -30;
}
