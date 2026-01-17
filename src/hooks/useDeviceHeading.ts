/**
 * Device Heading Hook
 * Uses magnetometer to get compass heading
 */

import { useCallback, useEffect, useState } from 'react';

// Types for expo-sensors
interface MagnetometerData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
}

interface MagnetometerSubscription {
    remove: () => void;
}

interface MagnetometerModule {
    isAvailableAsync: () => Promise<boolean>;
    addListener: (callback: (data: MagnetometerData) => void) => MagnetometerSubscription;
    setUpdateInterval: (interval: number) => void;
}

export interface DeviceHeadingState {
    heading: number; // 0-360 degrees from magnetic north
    accuracy: 'low' | 'medium' | 'high';
    isAvailable: boolean;
    isCalibrating: boolean;
    error: string | null;
}

/**
 * Calculate heading from magnetometer data
 * Returns degrees from magnetic north (0-360)
 */
function calculateHeading(x: number, y: number): number {
    // Calculate angle in radians
    let angle = Math.atan2(y, x);

    // Convert to degrees
    let degrees = angle * (180 / Math.PI);

    // Normalize to 0-360
    if (degrees < 0) {
        degrees += 360;
    }

    // Adjust for device orientation (assuming portrait)
    // This may need adjustment based on how device is held
    degrees = (degrees + 90) % 360;

    return Math.round(degrees);
}

/**
 * Smooth heading changes to avoid jitter
 */
function smoothHeading(current: number, previous: number, factor: number = 0.2): number {
    // Handle wraparound at 0/360
    let diff = current - previous;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    let smoothed = previous + diff * factor;

    // Normalize to 0-360
    if (smoothed < 0) smoothed += 360;
    if (smoothed >= 360) smoothed -= 360;

    return Math.round(smoothed);
}

export function useDeviceHeading(updateInterval: number = 100): DeviceHeadingState {
    const [heading, setHeading] = useState(0);
    const [accuracy, setAccuracy] = useState<'low' | 'medium' | 'high'>('medium');
    const [isAvailable, setIsAvailable] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const previousHeadingRef = { current: 0 };
    const sampleCount = { current: 0 };

    useEffect(() => {
        let subscription: MagnetometerSubscription | null = null;
        let mounted = true;

        async function initialize() {
            try {
                // Dynamic import for expo-sensors
                const { Magnetometer } = await import('expo-sensors') as { Magnetometer: MagnetometerModule };

                // Check if available
                const available = await Magnetometer.isAvailableAsync();

                if (!mounted) return;

                if (!available) {
                    setIsAvailable(false);
                    setError('Magnetometer not available on this device');
                    return;
                }

                setIsAvailable(true);
                setError(null);

                // Set update interval
                Magnetometer.setUpdateInterval(updateInterval);

                // Subscribe to updates
                subscription = Magnetometer.addListener((data: MagnetometerData) => {
                    if (!mounted) return;

                    const newHeading = calculateHeading(data.x, data.y);
                    const smoothedHeading = smoothHeading(newHeading, previousHeadingRef.current);

                    previousHeadingRef.current = smoothedHeading;
                    setHeading(smoothedHeading);

                    // Update calibration status
                    sampleCount.current++;
                    if (sampleCount.current > 10) {
                        setIsCalibrating(false);
                    }

                    // Estimate accuracy based on field strength
                    const fieldStrength = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
                    if (fieldStrength < 20) {
                        setAccuracy('low');
                    } else if (fieldStrength < 50) {
                        setAccuracy('medium');
                    } else {
                        setAccuracy('high');
                    }
                });

            } catch (err) {
                if (!mounted) return;
                console.error('[useDeviceHeading] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to access magnetometer');
                setIsAvailable(false);
            }
        }

        initialize();

        return () => {
            mounted = false;
            if (subscription) {
                subscription.remove();
            }
        };
    }, [updateInterval]);

    return {
        heading,
        accuracy,
        isAvailable,
        isCalibrating,
        error,
    };
}

/**
 * Hook for simulated heading (for demo mode or web)
 */
export function useSimulatedHeading(initialHeading: number = 0): {
    heading: number;
    setHeading: (h: number) => void;
    rotateBy: (degrees: number) => void;
} {
    const [heading, setHeading] = useState(initialHeading);

    const rotateBy = useCallback((degrees: number) => {
        setHeading(prev => {
            let newHeading = prev + degrees;
            while (newHeading < 0) newHeading += 360;
            while (newHeading >= 360) newHeading -= 360;
            return newHeading;
        });
    }, []);

    return {
        heading,
        setHeading,
        rotateBy,
    };
}

export default useDeviceHeading;
