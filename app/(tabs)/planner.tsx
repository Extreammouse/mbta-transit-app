import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { StopSelector } from '@/components/StopSelector/StopSelector';
import { TransferCard } from '@/components/TransferCard/TransferCard';
import { ConfidenceBadge } from '@/components/ConfidenceBadge/ConfidenceBadge';
import { ScenarioSimulator } from '@/components/ScenarioSimulator/ScenarioSimulator';
import { MBTA_COLORS } from '@/constants/Colors';
import { mbtaApi } from '@/src/services/mbta-api';
import { Route, Stop, Prediction, WalkingSpeed, ConfidenceLevel } from '@/src/types/mbta';
import { calculateTransfer, formatWalkingTime } from '@/src/services/transfer-calc';
import { formatTime, minutesUntil, getRouteColor } from '@/src/utils/helpers';

const queryClient = new QueryClient();

function TripPlannerScreen() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    const [selectedOrigin, setSelectedOrigin] = useState<Stop | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);
    const [originPredictions, setOriginPredictions] = useState<Prediction[]>([]);
    const [walkingSpeed, setWalkingSpeed] = useState<WalkingSpeed>('normal');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showScenarios, setShowScenarios] = useState(false);

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
        } catch (e) {
            console.error('Failed to load data:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load predictions when origin is selected
    const loadPredictions = useCallback(async () => {
        if (!selectedOrigin) return;
        try {
            setRefreshing(true);
            const predictions = await mbtaApi.getPredictions(selectedOrigin.id);
            setOriginPredictions(predictions);
        } catch (e) {
            console.error('Failed to load predictions:', e);
        } finally {
            setRefreshing(false);
        }
    }, [selectedOrigin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadPredictions();
        // Auto-refresh predictions every 15 seconds
        const interval = setInterval(loadPredictions, 15000);
        return () => clearInterval(interval);
    }, [loadPredictions]);

    const handleSwapStops = () => {
        const temp = selectedOrigin;
        setSelectedOrigin(selectedDestination);
        setSelectedDestination(temp);
    };

    // Calculate transfer info if both stops are selected
    const getTransferInfo = () => {
        if (!selectedOrigin || !selectedDestination) return null;

        // Get next prediction at origin
        const nextPrediction = originPredictions[0];
        const availableTime = nextPrediction
            ? minutesUntil(nextPrediction.attributes.departure_time || nextPrediction.attributes.arrival_time || '') * 60
            : 300; // Default 5 minutes

        return calculateTransfer(
            selectedOrigin,
            selectedDestination,
            walkingSpeed,
            availableTime
        );
    };

    const transferInfo = getTransferInfo();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={MBTA_COLORS.navy} />
                <Text style={styles.loadingText}>Loading stations...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={loadPredictions}
                    tintColor={MBTA_COLORS.navy}
                />
            }
        >
            {/* Station Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Plan Your Trip</Text>

                <View style={styles.stopsContainer}>
                    <StopSelector
                        stops={stops}
                        routes={routes}
                        selectedStop={selectedOrigin}
                        onSelectStop={setSelectedOrigin}
                        label="Origin Station"
                        placeholder="Where are you starting from?"
                    />

                    <TouchableOpacity
                        style={styles.swapButton}
                        onPress={handleSwapStops}
                        disabled={!selectedOrigin && !selectedDestination}
                    >
                        <View style={styles.swapButtonInner}>
                            <Ionicons
                                name="swap-vertical"
                                size={20}
                                color={selectedOrigin || selectedDestination ? MBTA_COLORS.navy : MBTA_COLORS.textLight}
                            />
                        </View>
                    </TouchableOpacity>

                    <StopSelector
                        stops={stops}
                        routes={routes}
                        selectedStop={selectedDestination}
                        onSelectStop={setSelectedDestination}
                        label="Destination Station"
                        placeholder="Where are you going?"
                    />
                </View>
            </View>

            {/* Transfer Information */}
            {selectedOrigin && selectedDestination && transferInfo && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transfer Guidance</Text>
                        <ConfidenceBadge confidence={transferInfo.confidence} size="small" />
                    </View>

                    <TransferCard
                        transfer={transferInfo}
                        fromRouteName="Current Line"
                        toRouteName="Connecting Line"
                        fromRouteColor={MBTA_COLORS.red}
                        toRouteColor={MBTA_COLORS.orange}
                    />

                    {/* Next Departures */}
                    {originPredictions.length > 0 && (
                        <View style={styles.predictionsCard}>
                            <Text style={styles.cardTitle}>Next Departures from {selectedOrigin.attributes.name}</Text>
                            {originPredictions.slice(0, 3).map((prediction, index) => {
                                const time = prediction.attributes.departure_time || prediction.attributes.arrival_time;
                                if (!time) return null;
                                const mins = minutesUntil(time);
                                const routeId = prediction.relationships?.route?.data?.id;
                                const route = routes.find((r) => r.id === routeId);

                                return (
                                    <View key={prediction.id} style={styles.predictionRow}>
                                        <View
                                            style={[
                                                styles.routeBadge,
                                                { backgroundColor: route ? getRouteColor(route.id, route.attributes.color) : MBTA_COLORS.navy },
                                            ]}
                                        >
                                            <Text style={styles.routeBadgeText}>
                                                {route?.attributes.short_name || routeId || '?'}
                                            </Text>
                                        </View>
                                        <Text style={styles.predictionDestination} numberOfLines={1}>
                                            {route?.attributes.direction_destinations?.[prediction.attributes.direction_id] || 'Unknown'}
                                        </Text>
                                        <Text style={[styles.predictionTime, mins <= 3 && styles.predictionTimeUrgent]}>
                                            {mins <= 0 ? 'Now' : `${mins} min`}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            )}

            {/* What-If Scenarios */}
            {selectedOrigin && selectedDestination && transferInfo && (
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.scenarioToggle}
                        onPress={() => setShowScenarios(!showScenarios)}
                    >
                        <View style={styles.scenarioToggleContent}>
                            <Ionicons name="flask-outline" size={20} color={MBTA_COLORS.navy} />
                            <Text style={styles.scenarioToggleText}>What-If Scenarios</Text>
                        </View>
                        <Ionicons
                            name={showScenarios ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={MBTA_COLORS.textLight}
                        />
                    </TouchableOpacity>

                    {showScenarios && (
                        <ScenarioSimulator
                            originalBufferSeconds={transferInfo.bufferSeconds}
                            walkingSpeed={walkingSpeed}
                            onSpeedChange={setWalkingSpeed}
                        />
                    )}
                </View>
            )}

            {/* Empty State */}
            {!selectedOrigin && !selectedDestination && (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="navigate-circle-outline" size={64} color={MBTA_COLORS.navy} />
                    </View>
                    <Text style={styles.emptyTitle}>Plan Your Trip</Text>
                    <Text style={styles.emptyText}>
                        Select your origin and destination to see transfer guidance, walking times,
                        and connection confidence.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

export default function TripPlannerWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <TripPlannerScreen />
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MBTA_COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
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
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
        marginBottom: 12,
    },
    stopsContainer: {
        position: 'relative',
    },
    swapButton: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -18,
        zIndex: 10,
    },
    swapButtonInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    predictionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginBottom: 12,
    },
    predictionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12,
    },
    routeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        minWidth: 44,
        alignItems: 'center',
    },
    routeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    predictionDestination: {
        flex: 1,
        fontSize: 14,
        color: MBTA_COLORS.text,
    },
    predictionTime: {
        fontSize: 16,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    predictionTimeUrgent: {
        color: MBTA_COLORS.red,
    },
    scenarioToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    scenarioToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scenarioToggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.navy,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: MBTA_COLORS.textLight,
        textAlign: 'center',
        lineHeight: 22,
    },
});
