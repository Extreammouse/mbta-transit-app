import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Prediction, Route, Stop } from '../../src/types/mbta';
import { MBTA_COLORS } from '../../constants/Colors';
import { getRouteColor, formatTime, minutesUntil, formatMinutesUntil } from '../../src/utils/helpers';

interface ConnectionFinderProps {
    predictions: Prediction[];
    routes: Map<string, Route>;
    stops: Map<string, Stop>;
    loading?: boolean;
    onRefresh?: () => void;
    title?: string;
}

interface PredictionItemProps {
    prediction: Prediction;
    route?: Route;
    stop?: Stop;
}

function PredictionItem({ prediction, route, stop }: PredictionItemProps) {
    const arrivalTime = prediction.attributes.arrival_time || prediction.attributes.departure_time;
    if (!arrivalTime) return null;

    const minutes = minutesUntil(arrivalTime);
    const routeColor = route ? getRouteColor(route.id, route.attributes.color) : MBTA_COLORS.navy;

    const isArriving = minutes <= 1;
    const isImminent = minutes <= 5;

    return (
        <View style={styles.predictionItem}>
            <View style={[styles.routeBadge, { backgroundColor: routeColor }]}>
                <Text style={styles.routeBadgeText}>
                    {route?.attributes.short_name || route?.id || '?'}
                </Text>
            </View>

            <View style={styles.predictionInfo}>
                <Text style={styles.destinationText} numberOfLines={1}>
                    {route?.attributes.direction_destinations?.[prediction.attributes.direction_id] || 'Unknown'}
                </Text>
                {stop && (
                    <Text style={styles.stopText} numberOfLines={1}>
                        at {stop.attributes.name}
                    </Text>
                )}
            </View>

            <View style={styles.timeContainer}>
                <Text
                    style={[
                        styles.minutesText,
                        isArriving && styles.arrivingText,
                        isImminent && !isArriving && styles.imminentText,
                    ]}
                >
                    {formatMinutesUntil(minutes)}
                </Text>
                <Text style={styles.exactTime}>{formatTime(arrivalTime)}</Text>
            </View>
        </View>
    );
}

export function ConnectionFinder({
    predictions,
    routes,
    stops,
    loading = false,
    onRefresh,
    title = 'Next Connections',
}: ConnectionFinderProps) {
    const renderPrediction = ({ item }: { item: Prediction }) => {
        const routeId = item.relationships?.route?.data?.id;
        const stopId = item.relationships?.stop?.data?.id;

        return (
            <PredictionItem
                prediction={item}
                route={routeId ? routes.get(routeId) : undefined}
                stop={stopId ? stops.get(stopId) : undefined}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            {predictions.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No upcoming connections</Text>
                    <Text style={styles.emptySubtext}>
                        Select a stop to see real-time arrivals
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={predictions}
                    renderItem={renderPrediction}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={onRefresh}
                                tintColor={MBTA_COLORS.navy}
                            />
                        ) : undefined
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: MBTA_COLORS.red,
    },
    liveText: {
        fontSize: 11,
        fontWeight: '700',
        color: MBTA_COLORS.red,
        letterSpacing: 0.5,
    },
    listContent: {
        padding: 12,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 4,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        gap: 12,
    },
    routeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 56,
        alignItems: 'center',
    },
    routeBadgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    predictionInfo: {
        flex: 1,
    },
    destinationText: {
        fontSize: 15,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    stopText: {
        fontSize: 13,
        color: MBTA_COLORS.textLight,
        marginTop: 2,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    minutesText: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    arrivingText: {
        color: MBTA_COLORS.red,
    },
    imminentText: {
        color: MBTA_COLORS.orange,
    },
    exactTime: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
        marginTop: 2,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    emptySubtext: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default ConnectionFinder;
