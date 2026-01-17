import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransferInfo } from '../../src/types/mbta';
import { MBTA_COLORS } from '../../constants/Colors';
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge';
import { formatWalkingTime, formatDistance } from '../../src/services/transfer-calc';
import { Ionicons } from '@expo/vector-icons';

interface TransferCardProps {
    transfer: TransferInfo;
    fromRouteName?: string;
    toRouteName?: string;
    fromRouteColor?: string;
    toRouteColor?: string;
}

export function TransferCard({
    transfer,
    fromRouteName,
    toRouteName,
    fromRouteColor = MBTA_COLORS.navy,
    toRouteColor = MBTA_COLORS.navy,
}: TransferCardProps) {
    return (
        <View style={styles.container}>
            {/* Header with confidence badge */}
            <View style={styles.header}>
                <View style={styles.transferLabel}>
                    <Ionicons name="swap-horizontal" size={20} color={MBTA_COLORS.navy} />
                    <Text style={styles.headerText}>Transfer</Text>
                </View>
                <ConfidenceBadge confidence={transfer.confidence} size="medium" />
            </View>

            {/* Transfer details */}
            <View style={styles.content}>
                {/* From station */}
                <View style={styles.stationRow}>
                    <View style={[styles.stationDot, { backgroundColor: fromRouteColor }]} />
                    <View style={styles.stationInfo}>
                        <Text style={styles.stationLabel}>From</Text>
                        <Text style={styles.stationName}>{transfer.fromStop.attributes.name}</Text>
                        {fromRouteName && (
                            <Text style={[styles.routeName, { color: fromRouteColor }]}>
                                {fromRouteName}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Walking indicator */}
                <View style={styles.walkingSection}>
                    <View style={styles.walkingLine} />
                    <View style={styles.walkingInfo}>
                        <Ionicons name="walk" size={24} color={MBTA_COLORS.textLight} />
                        <View style={styles.walkingDetails}>
                            <Text style={styles.walkingTime}>
                                {formatWalkingTime(transfer.walkingTimeSeconds)}
                            </Text>
                            <Text style={styles.walkingDistance}>
                                {formatDistance(transfer.walkingDistanceMeters)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.walkingLine} />
                </View>

                {/* To station */}
                <View style={styles.stationRow}>
                    <View style={[styles.stationDot, { backgroundColor: toRouteColor }]} />
                    <View style={styles.stationInfo}>
                        <Text style={styles.stationLabel}>To</Text>
                        <Text style={styles.stationName}>{transfer.toStop.attributes.name}</Text>
                        {toRouteName && (
                            <Text style={[styles.routeName, { color: toRouteColor }]}>
                                {toRouteName}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Buffer time indicator */}
            <View style={styles.footer}>
                <Text style={styles.bufferLabel}>
                    {transfer.bufferSeconds >= 0 ? 'Buffer time:' : 'Time short by:'}
                </Text>
                <Text
                    style={[
                        styles.bufferTime,
                        { color: transfer.bufferSeconds >= 0 ? MBTA_COLORS.success : MBTA_COLORS.error },
                    ]}
                >
                    {formatWalkingTime(Math.abs(transfer.bufferSeconds))}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    transferLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    content: {
        paddingHorizontal: 4,
    },
    stationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    stationDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginTop: 2,
    },
    stationInfo: {
        flex: 1,
    },
    stationLabel: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    stationName: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginTop: 2,
    },
    routeName: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    walkingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        paddingLeft: 7,
    },
    walkingLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    walkingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    walkingDetails: {
        alignItems: 'center',
    },
    walkingTime: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    walkingDistance: {
        fontSize: 11,
        color: MBTA_COLORS.textLight,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 8,
    },
    bufferLabel: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
    },
    bufferTime: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default TransferCard;
