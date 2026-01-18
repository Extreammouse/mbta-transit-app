import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { MBTA_COLORS } from '@/constants/Colors';
import { mbtaApi } from '@/src/services/mbta-api';
import { Prediction, Route, Stop } from '@/src/types/mbta';
import { formatMinutesUntil, formatTime, getRouteColor, minutesUntil } from '@/src/utils/helpers';

const queryClient = new QueryClient();

interface RouteGroup {
    route: Route;
    predictions: Prediction[];
}

function LiveConnectionsScreen() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Popular stations for quick access
    const POPULAR_STATIONS = [
        'place-dwnxg', // Downtown Crossing
        'place-pktrm', // Park Street
        'place-sstat', // South Station
        'place-north', // North Station
        'place-haecl', // Haymarket
        'place-gover', // Government Center
    ];

    // Load initial data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const subwayRoutes = await mbtaApi.getSubwayRoutes();
            setRoutes(subwayRoutes);

            const routeIds = subwayRoutes.map((r) => r.id);
            const allStops = await mbtaApi.getStopsForRoutes(routeIds);
            const uniqueStops = allStops.filter(
                (stop) =>
                    stop.attributes.location_type === 1 ||
                    !stop.relationships?.parent_station?.data
            );
            setStops(uniqueStops);

            // Select first popular station that exists
            const popularStop = uniqueStops.find((s) => POPULAR_STATIONS.includes(s.id));
            if (popularStop) {
                setSelectedStop(popularStop);
            }
        } catch (e) {
            // Silent fail for offline mode
        } finally {
            setLoading(false);
        }
    }, []);

    // Load predictions for selected stop
    const loadPredictions = useCallback(async () => {
        if (!selectedStop) return;
        try {
            setRefreshing(true);
            const preds = await mbtaApi.getPredictions(selectedStop.id);
            setPredictions(preds);
            setLastUpdated(new Date());
        } catch (e) {
            // Silent fail for offline mode
        } finally {
            setRefreshing(false);
        }
    }, [selectedStop]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadPredictions();
        const interval = setInterval(loadPredictions, 15000);
        return () => clearInterval(interval);
    }, [loadPredictions]);

    // Group predictions by route
    const groupedPredictions = (): RouteGroup[] => {
        const groups = new Map<string, Prediction[]>();

        predictions.forEach((pred) => {
            const routeId = pred.relationships?.route?.data?.id || 'unknown';
            if (!groups.has(routeId)) {
                groups.set(routeId, []);
            }
            groups.get(routeId)!.push(pred);
        });

        return Array.from(groups.entries())
            .map(([routeId, preds]) => ({
                route: routes.find((r) => r.id === routeId) || ({
                    id: routeId,
                    type: 'route',
                    attributes: { short_name: routeId, color: MBTA_COLORS.navy },
                } as Route),
                predictions: preds.slice(0, 4), // Show max 4 per route
            }))
            .sort((a, b) => a.route.id.localeCompare(b.route.id));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={MBTA_COLORS.navy} />
                <Text style={styles.loadingText}>Loading connections...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Station Selector */}
            <View style={styles.stationHeader}>
                <TouchableOpacity style={styles.stationSelector}>
                    <View style={styles.stationIcon}>
                        <Ionicons name="train" size={20} color={MBTA_COLORS.navy} />
                    </View>
                    <View style={styles.stationInfo}>
                        <Text style={styles.stationLabel}>Viewing arrivals at</Text>
                        <Text style={styles.stationName}>
                            {selectedStop?.attributes.name || 'Select a station'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={MBTA_COLORS.textLight} />
                </TouchableOpacity>
            </View>

            {/* Quick Station Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContent}
            >
                {stops
                    .filter((s) => POPULAR_STATIONS.includes(s.id))
                    .map((stop) => {
                        // Map station ID to image resource
                        const STATION_IMAGES: Record<string, any> = {
                            'place-dwnxg': require('../../assets/images/downtown_crossing.png'),
                            'place-pktrm': require('../../assets/images/park_street.png'),
                            'place-sstat': require('../../assets/images/south_station.png'),
                            'place-north': require('../../assets/images/north_station.png'),
                            'place-haecl': require('../../assets/images/haymarket.png'),
                            'place-gover': require('../../assets/images/government_center.png'),
                        };
                        const imageSource = STATION_IMAGES[stop.id];

                        return (
                            <TouchableOpacity
                                key={stop.id}
                                style={[
                                    styles.stationCard,
                                    selectedStop?.id === stop.id && styles.stationCardActive,
                                ]}
                                onPress={() => setSelectedStop(stop)}
                                activeOpacity={0.8}
                            >
                                {imageSource && (
                                    <Image
                                        source={imageSource}
                                        style={styles.stationCardImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={styles.stationCardOverlay}>
                                    <Text
                                        style={styles.stationCardText}
                                        numberOfLines={2}
                                    >
                                        {stop.attributes.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>

            {/* Live Indicator */}
            <View style={styles.liveHeader}>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
                {lastUpdated && (
                    <Text style={styles.lastUpdated}>
                        Updated {formatTime(lastUpdated)}
                    </Text>
                )}
            </View>

            {/* Predictions List */}
            <ScrollView
                style={styles.predictionsContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadPredictions}
                        tintColor={MBTA_COLORS.navy}
                    />
                }
            >
                {groupedPredictions().length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={48} color={MBTA_COLORS.textLight} />
                        <Text style={styles.emptyText}>No upcoming arrivals</Text>
                        <Text style={styles.emptySubtext}>
                            Check back later for live predictions
                        </Text>
                    </View>
                ) : (
                    groupedPredictions().map((group) => (
                        <View key={group.route.id} style={styles.routeGroup}>
                            <View style={styles.routeHeader}>
                                <View
                                    style={[
                                        styles.routeBadge,
                                        { backgroundColor: getRouteColor(group.route.id, group.route.attributes.color) },
                                    ]}
                                >
                                    <Text style={styles.routeBadgeText}>
                                        {group.route.attributes.short_name || group.route.id}
                                    </Text>
                                </View>
                                <Text style={styles.routeName} numberOfLines={1}>
                                    {group.route.attributes.long_name || group.route.id}
                                </Text>
                            </View>

                            {group.predictions.map((pred, index) => {
                                const time = pred.attributes.arrival_time || pred.attributes.departure_time;
                                if (!time) return null;
                                const mins = minutesUntil(time);
                                const destination = group.route.attributes.direction_destinations?.[
                                    pred.attributes.direction_id
                                ];

                                return (
                                    <View key={pred.id} style={styles.predictionRow}>
                                        <View style={styles.directionIndicator}>
                                            <Ionicons
                                                name={pred.attributes.direction_id === 0 ? 'arrow-up' : 'arrow-down'}
                                                size={16}
                                                color={MBTA_COLORS.textLight}
                                            />
                                        </View>
                                        <Text style={styles.destination} numberOfLines={1}>
                                            {destination || `Direction ${pred.attributes.direction_id} `}
                                        </Text>
                                        <View style={styles.timeInfo}>
                                            <Text
                                                style={[
                                                    styles.minutesText,
                                                    mins <= 1 && styles.arrivingNow,
                                                    mins > 1 && mins <= 5 && styles.arrivingSoon,
                                                ]}
                                            >
                                                {formatMinutesUntil(mins)}
                                            </Text>
                                            <Text style={styles.exactTime}>{formatTime(time)}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

export default function LiveConnectionsWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <LiveConnectionsScreen />
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MBTA_COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MBTA_COLORS.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: MBTA_COLORS.textLight,
    },
    stationHeader: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    stationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stationInfo: {
        flex: 1,
    },
    stationLabel: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
    },
    stationName: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
        marginTop: 2,
    },
    chipsScroll: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        // Removed fixed maxHeight to let content define sizing tight
        flexGrow: 0,
    },
    chipsContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        flexDirection: 'row',
    },
    stationCard: {
        width: 120,
        height: 120, // Increased from 90
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
        marginRight: 10,
    },
    stationCardActive: {
        borderColor: MBTA_COLORS.navy,
    },
    stationCardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    stationCardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay for readability
        justifyContent: 'flex-end',
        padding: 8,
    },
    stationCardText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    liveHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 8,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: MBTA_COLORS.red,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '700',
        color: MBTA_COLORS.red,
        letterSpacing: 0.5,
    },
    lastUpdated: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
    },
    predictionsContainer: {
        flex: 1,
        padding: 16,
        paddingTop: 8,
    },
    emptyState: {
        alignItems: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        marginTop: 4,
    },
    routeGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12,
    },
    routeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 56,
        alignItems: 'center',
    },
    routeBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    routeName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    predictionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        gap: 12,
    },
    directionIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    destination: {
        flex: 1,
        fontSize: 15,
        color: MBTA_COLORS.text,
    },
    timeInfo: {
        alignItems: 'flex-end',
    },
    minutesText: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    arrivingNow: {
        color: MBTA_COLORS.red,
    },
    arrivingSoon: {
        color: MBTA_COLORS.orange,
    },
    exactTime: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
        marginTop: 2,
    },
});
