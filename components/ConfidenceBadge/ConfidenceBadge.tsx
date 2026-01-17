import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ConfidenceLevel } from '../../src/types/mbta';
import { MBTA_COLORS } from '../../constants/Colors';

interface ConfidenceBadgeProps {
    confidence: ConfidenceLevel;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
    onPress?: () => void;
}

const BADGE_COLORS = {
    likely: {
        background: MBTA_COLORS.likely,
        text: '#FFFFFF',
        label: 'Likely',
        icon: '✓',
    },
    risky: {
        background: MBTA_COLORS.risky,
        text: '#FFFFFF',
        label: 'Risky',
        icon: '!',
    },
    unlikely: {
        background: MBTA_COLORS.unlikely,
        text: '#FFFFFF',
        label: 'Unlikely',
        icon: '✗',
    },
};

const SIZES = {
    small: {
        badge: 24,
        icon: 12,
        label: 10,
        padding: 4,
    },
    medium: {
        badge: 32,
        icon: 16,
        label: 12,
        padding: 8,
    },
    large: {
        badge: 48,
        icon: 24,
        label: 14,
        padding: 12,
    },
};

export function ConfidenceBadge({
    confidence,
    size = 'medium',
    showLabel = true,
    onPress,
}: ConfidenceBadgeProps) {
    const colors = BADGE_COLORS[confidence];
    const sizeConfig = SIZES[size];

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.container, showLabel && styles.containerWithLabel]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.badge,
                    {
                        backgroundColor: colors.background,
                        width: sizeConfig.badge,
                        height: sizeConfig.badge,
                        borderRadius: sizeConfig.badge / 2,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.icon,
                        {
                            fontSize: sizeConfig.icon,
                            color: colors.text,
                        },
                    ]}
                >
                    {colors.icon}
                </Text>
            </View>
            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        {
                            fontSize: sizeConfig.label,
                            color: colors.background,
                        },
                    ]}
                >
                    {colors.label}
                </Text>
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerWithLabel: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        fontWeight: 'bold',
    },
    label: {
        fontWeight: '600',
    },
});

export default ConfidenceBadge;
