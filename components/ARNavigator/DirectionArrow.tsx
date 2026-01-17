/**
 * Direction Arrow Component
 * Animated arrow that points toward the navigation target
 */

import type { Direction } from '@/src/data/demoScenarios';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DirectionArrowProps {
    direction: Direction | null;
    deviceHeading?: number; // Current device compass heading (0-360)
    targetBearing?: number; // Bearing to target (0-360)
    size?: 'small' | 'medium' | 'large';
    color?: string;
    showGlow?: boolean;
}

// Map direction to rotation angle (degrees)
const DIRECTION_TO_ROTATION: Record<Direction, number> = {
    straight: 0,    // Arrow points up
    left: -90,      // Arrow points left  
    right: 90,      // Arrow points right
    back: 180,      // Arrow points down
    up: 0,          // Arrow points up (with different style)
    down: 180,      // Arrow points down (with different style)
    arrived: 0,     // No rotation, different style
};

// Size configurations
const SIZE_CONFIG = {
    small: { arrowSize: 60, strokeWidth: 4 },
    medium: { arrowSize: 100, strokeWidth: 6 },
    large: { arrowSize: 150, strokeWidth: 8 },
};

export function DirectionArrow({
    direction,
    deviceHeading = 0,
    targetBearing,
    size = 'large',
    color = '#00843D', // MBTA Green
    showGlow = true,
}: DirectionArrowProps) {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const { arrowSize, strokeWidth } = SIZE_CONFIG[size];

    // Calculate rotation based on direction or bearing
    useEffect(() => {
        let targetRotation: number;

        if (targetBearing !== undefined && deviceHeading !== undefined) {
            // Calculate relative bearing
            targetRotation = targetBearing - deviceHeading;
            // Normalize to -180 to 180
            while (targetRotation > 180) targetRotation -= 360;
            while (targetRotation < -180) targetRotation += 360;
        } else if (direction) {
            targetRotation = DIRECTION_TO_ROTATION[direction];
        } else {
            targetRotation = 0;
        }

        rotation.value = withSpring(targetRotation, {
            damping: 15,
            stiffness: 100,
        });
    }, [direction, deviceHeading, targetBearing, rotation]);

    // Pulse animation for "arrived" state
    useEffect(() => {
        if (direction === 'arrived') {
            scale.value = withTiming(1.2, { duration: 500 }, () => {
                scale.value = withTiming(1, { duration: 500 });
            });
        }
    }, [direction, scale]);

    // Animated styles
    const animatedArrowStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    // Don't render if no direction
    if (!direction) {
        return null;
    }

    // Render checkmark for "arrived"
    if (direction === 'arrived') {
        return (
            <View style={styles.container}>
                <Animated.View style={[styles.arrivedCircle, animatedArrowStyle, { borderColor: color }]}>
                    <View style={styles.checkmark}>
                        <View style={[styles.checkmarkShort, { backgroundColor: color }]} />
                        <View style={[styles.checkmarkLong, { backgroundColor: color }]} />
                    </View>
                </Animated.View>
            </View>
        );
    }

    // Render vertical arrow for up/down
    if (direction === 'up' || direction === 'down') {
        return (
            <View style={styles.container}>
                <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
                    {showGlow && (
                        <View style={[styles.glow, { backgroundColor: color, width: arrowSize * 1.5, height: arrowSize * 1.5 }]} />
                    )}
                    <View style={[styles.verticalArrow, { borderBottomColor: color, borderBottomWidth: arrowSize / 2 }]}>
                        <View style={[styles.verticalArrowStem, { backgroundColor: color, height: arrowSize / 2 }]} />
                    </View>
                    <View style={[
                        styles.arrowHead,
                        {
                            borderLeftWidth: arrowSize / 3,
                            borderRightWidth: arrowSize / 3,
                            borderBottomWidth: arrowSize / 2,
                            borderBottomColor: color,
                        }
                    ]} />
                    <View style={[
                        styles.arrowStem,
                        {
                            width: arrowSize / 4,
                            height: arrowSize / 2,
                            backgroundColor: color,
                        }
                    ]} />
                </Animated.View>
            </View>
        );
    }

    // Render standard directional arrow
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
                {showGlow && (
                    <View style={[
                        styles.glow,
                        {
                            backgroundColor: color,
                            width: arrowSize * 1.5,
                            height: arrowSize * 1.5,
                            opacity: 0.3,
                        }
                    ]} />
                )}
                {/* Arrow head (triangle) */}
                <View style={[
                    styles.arrowHead,
                    {
                        borderLeftWidth: arrowSize / 2.5,
                        borderRightWidth: arrowSize / 2.5,
                        borderBottomWidth: arrowSize / 1.5,
                        borderBottomColor: color,
                    }
                ]} />
                {/* Arrow stem (rectangle) */}
                <View style={[
                    styles.arrowStem,
                    {
                        width: arrowSize / 4,
                        height: arrowSize / 2,
                        backgroundColor: color,
                    }
                ]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.3,
        left: 0,
        right: 0,
    },
    arrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        borderRadius: 100,
        opacity: 0.3,
    },
    arrowHead: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    arrowStem: {
        marginTop: -5,
        borderRadius: 4,
    },
    verticalArrow: {
        alignItems: 'center',
    },
    verticalArrowStem: {
        width: 20,
        marginTop: -5,
    },
    arrivedCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 6,
        backgroundColor: 'rgba(0, 132, 61, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        width: 50,
        height: 50,
        position: 'relative',
    },
    checkmarkShort: {
        position: 'absolute',
        left: 8,
        top: 25,
        width: 15,
        height: 6,
        borderRadius: 3,
        transform: [{ rotate: '45deg' }],
    },
    checkmarkLong: {
        position: 'absolute',
        left: 18,
        top: 18,
        width: 30,
        height: 6,
        borderRadius: 3,
        transform: [{ rotate: '-45deg' }],
    },
});

export default DirectionArrow;
