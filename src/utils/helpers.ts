/**
 * Format a date for display as time (e.g., "3:45 PM")
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Calculate minutes until a given time
 */
export function minutesUntil(targetTime: Date | string): number {
    const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    return Math.round(diffMs / 60000);
}

/**
 * Format minutes until arrival for display
 */
export function formatMinutesUntil(minutes: number): string {
    if (minutes <= 0) {
        return 'Now';
    } else if (minutes === 1) {
        return '1 min';
    } else if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} hr`;
        }
        return `${hours} hr ${mins} min`;
    }
}

/**
 * Format a countdown timer (e.g., "2:30")
 */
export function formatCountdown(seconds: number): string {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTimeString(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Add minutes to current time and return HH:MM format
 */
export function getTimeAfterMinutes(minutes: number): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
}

/**
 * Decode a Google polyline string into coordinate pairs
 */
export function decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let b: number;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
}

/**
 * Get route color based on route ID or type
 */
export function getRouteColor(routeId: string, routeColor?: string): string {
    // If API provides color, use it (removing # if present)
    if (routeColor) {
        return routeColor.startsWith('#') ? routeColor : `#${routeColor}`;
    }

    // Fallback to known route colors
    const routeColors: { [key: string]: string } = {
        'Red': '#DA291C',
        'Orange': '#ED8B00',
        'Green-B': '#00843D',
        'Green-C': '#00843D',
        'Green-D': '#00843D',
        'Green-E': '#00843D',
        'Blue': '#003DA5',
        'Mattapan': '#DA291C',
    };

    // Check for exact match
    if (routeColors[routeId]) {
        return routeColors[routeId];
    }

    // Check for partial match (e.g., "CR-Worcester" should be purple)
    if (routeId.startsWith('CR-')) {
        return '#80276C'; // Commuter Rail purple
    }

    // Default to MBTA navy
    return '#1C345F';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Group predictions by route
 */
export function groupByRoute<T extends { relationships?: { route?: { data: { id: string } } } }>(
    items: T[]
): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    items.forEach(item => {
        const routeId = item.relationships?.route?.data?.id || 'unknown';
        if (!grouped.has(routeId)) {
            grouped.set(routeId, []);
        }
        grouped.get(routeId)!.push(item);
    });

    return grouped;
}
