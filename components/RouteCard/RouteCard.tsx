import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Route } from '../../src/types/mbta';
import { MBTA_COLORS } from '../../constants/Colors';
import { getRouteColor } from '../../src/utils/helpers';

interface RouteCardProps {
    route: Route;
    onPress?: () => void;
    selected?: boolean;
    showDestinations?: boolean;
}

export function RouteCard({
    route,
    onPress,
    selected = false,
    showDestinations = true,
}: RouteCardProps) {
    const routeColor = getRouteColor(route.id, route.attributes.color);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected && styles.containerSelected,
                { borderLeftColor: routeColor },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <View style={[styles.badge, { backgroundColor: routeColor }]}>
                    <Text style={styles.badgeText}>
                        {route.attributes.short_name || route.id}
                    </Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                    {route.attributes.long_name}
                </Text>
            </View>

            {showDestinations && route.attributes.direction_destinations && (
                <View style={styles.destinations}>
                    <Text style={styles.destinationLabel}>Directions:</Text>
                    {route.attributes.direction_destinations.map((dest, index) => (
                        <View key={index} style={styles.destinationRow}>
                            <View style={[styles.directionDot, { backgroundColor: routeColor }]} />
                            <Text style={styles.destinationText} numberOfLines={1}>
                                {dest}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginVertical: 6,
    },
    containerSelected: {
        backgroundColor: '#F0F4FF',
        borderWidth: 2,
        borderColor: MBTA_COLORS.navy,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 50,
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    destinations: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    destinationLabel: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
        marginBottom: 6,
    },
    destinationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    directionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    destinationText: {
        fontSize: 14,
        color: MBTA_COLORS.text,
        flex: 1,
    },
});

export default RouteCard;
