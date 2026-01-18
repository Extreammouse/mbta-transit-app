import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ConfidenceBadge } from '@/components/ConfidenceBadge/ConfidenceBadge';
import { ScenarioSimulator } from '@/components/ScenarioSimulator/ScenarioSimulator';
import { StopSelector } from '@/components/StopSelector/StopSelector';
import { TransferCard } from '@/components/TransferCard/TransferCard';
import { MBTA_COLORS } from '@/constants/Colors';
import { getLLMNavigationService } from '@/src/services/llmNavigationService';
import { mbtaApi } from '@/src/services/mbta-api';
import { calculateTransfer, calculateWalkingTime } from '@/src/services/transfer-calc';
import { Prediction, Route, Stop, WalkingSpeed } from '@/src/types/mbta';
import { getRouteColor, minutesUntil } from '@/src/utils/helpers';

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

    // AI Insights state
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiModelReady, setAiModelReady] = useState(false);

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
            // Silent fail for offline mode
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
            // Silent fail for offline mode - predictions will just stay empty
            // This prevents error spam in the console when offline
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

    // Initialize AI model
    useEffect(() => {
        const initAI = async () => {
            const llmService = getLLMNavigationService();
            const ready = await llmService.initialize();
            setAiModelReady(ready);
        };
        initAI();
    }, []);

    // Handle AI query for connection insights
    const handleAIQuery = async () => {
        if (!aiQuery.trim()) return;

        setAiLoading(true);
        try {
            const llmService = getLLMNavigationService();

            // Build context about the current trip
            let context = aiQuery;
            if (selectedOrigin && selectedDestination) {
                const transferInfo = getTransferInfo();
                context = `I'm traveling from ${selectedOrigin.attributes.name} to ${selectedDestination.attributes.name}. `;
                if (transferInfo) {
                    context += `Walking time is about ${transferInfo.walkingTimeSeconds / 60} minutes. `;
                    context += `Transfer confidence is ${transferInfo.confidence}. `;
                }
                if (originPredictions.length > 0) {
                    const nextTime = minutesUntil(originPredictions[0].attributes.departure_time || originPredictions[0].attributes.arrival_time || '');
                    context += `Next departure in ${nextTime} minutes. `;
                }
                context += aiQuery;
            }

            const response = await llmService.getDirections(context);
            setAiResponse(response.text);
        } catch (error) {
            setAiResponse('Sorry, I had trouble processing that. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    // Quick AI insights about current connection
    const getQuickInsight = async () => {
        if (!selectedOrigin || !selectedDestination) return;

        setAiLoading(true);
        const transferInfo = getTransferInfo();
        try {
            const llmService = getLLMNavigationService();
            const query = `Give me a quick tip about transferring from ${selectedOrigin.attributes.name} to ${selectedDestination.attributes.name}. Is it an easy transfer?`;
            const response = await llmService.getDirections(query);
            setAiResponse(response.text);
        } catch (error) {
            setAiResponse('AI insights temporarily unavailable.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSwapStops = () => {
        const temp = selectedOrigin;
        setSelectedOrigin(selectedDestination);
        setSelectedDestination(temp);
    };

    // Calculate transfer info if both stops are selected
    const getTransferInfo = () => {
        if (!selectedOrigin || !selectedDestination) return null;

        // Calculate walking time first
        const walkingTime = calculateWalkingTime(selectedOrigin, selectedDestination, walkingSpeed);
        const walkingMinutes = Math.ceil(walkingTime / 60);

        // Simulate realistic connecting train arrival times
        // Based on walking distance to create varied demo scenarios:
        // - Short walks (< 3 min): High buffer → "likely"
        // - Medium walks (3-8 min): Small buffer → "risky" 
        // - Long walks (> 8 min): Negative buffer → "unlikely"

        let bufferSeconds: number;
        if (walkingMinutes <= 3) {
            // Short transfer: next train in walking time + 3 min
            bufferSeconds = 180; // 3 min buffer = "likely"
        } else if (walkingMinutes <= 8) {
            // Medium transfer: next train in walking time + 1 min  
            bufferSeconds = 60; // 1 min buffer = "risky"
        } else {
            // Long transfer: next train arrives before you finish walking
            bufferSeconds = -60; // -1 min buffer = "unlikely"
        }

        const availableTime = walkingTime + bufferSeconds;

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
                            <Ionicons name="sparkles" size={14} color={MBTA_COLORS.orange} />
                            <Text style={styles.aiPoweredBadge}>AI</Text>
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
                            originName={selectedOrigin.attributes.name}
                            destinationName={selectedDestination.attributes.name}
                        />
                    )}
                </View>
            )}
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
    aiPoweredBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: MBTA_COLORS.orange,
        backgroundColor: 'rgba(237, 139, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
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
    aiLoadingBadge: {
        fontSize: 10,
        color: MBTA_COLORS.orange,
        backgroundColor: 'rgba(237, 139, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    aiInsightsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    quickInsightButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MBTA_COLORS.orange,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
        marginBottom: 16,
    },
    quickInsightText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    aiQueryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    aiQueryInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: MBTA_COLORS.text,
    },
    aiSendButton: {
        padding: 8,
    },
    aiResponseContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(237, 139, 0, 0.08)',
        borderRadius: 8,
        padding: 12,
        gap: 10,
    },
    aiThinking: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        fontStyle: 'italic',
    },
    aiResponseText: {
        flex: 1,
        fontSize: 14,
        color: MBTA_COLORS.text,
        lineHeight: 20,
    },
});
