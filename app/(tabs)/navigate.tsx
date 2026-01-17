/**
 * Navigate Screen
 * AR indoor navigation for MBTA stations
 */

import { ARNavigator } from '@/components/ARNavigator';
import { MBTA_COLORS } from '@/constants/Colors';
import { DEMO_SCENARIOS } from '@/src/data/demoScenarios';
import { STATION_DATA, type StationId } from '@/src/data/stationContext';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ViewMode = 'select' | 'ar-demo' | 'ar-live';

export default function NavigateScreen() {
    const [viewMode, setViewMode] = useState<ViewMode>('select');
    const [selectedStation, setSelectedStation] = useState<StationId | null>(null);

    // Selection screen
    if (viewMode === 'select') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🧭 Indoor Navigation</Text>
                    <Text style={styles.headerSubtitle}>
                        AR-guided navigation for MBTA stations
                    </Text>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    {/* Demo Mode Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <FontAwesome name="magic" size={20} color={MBTA_COLORS.orange} />
                            <Text style={styles.cardTitle}>Demo Mode</Text>
                            <View style={styles.recommendedBadge}>
                                <Text style={styles.recommendedText}>For Presentations</Text>
                            </View>
                        </View>
                        <Text style={styles.cardDescription}>
                            Pre-built walkthroughs to demonstrate AR navigation on stage.
                            No actual location needed - perfect for demos!
                        </Text>

                        {/* Demo Scenarios */}
                        <View style={styles.scenarioList}>
                            {DEMO_SCENARIOS.slice(0, 3).map((scenario) => (
                                <TouchableOpacity
                                    key={scenario.id}
                                    style={styles.scenarioItem}
                                    onPress={() => setViewMode('ar-demo')}
                                >
                                    <View style={styles.scenarioIcon}>
                                        <FontAwesome name="subway" size={16} color={MBTA_COLORS.red} />
                                    </View>
                                    <View style={styles.scenarioInfo}>
                                        <Text style={styles.scenarioName}>{scenario.name}</Text>
                                        <Text style={styles.scenarioStation}>{scenario.station}</Text>
                                    </View>
                                    <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setViewMode('ar-demo')}
                        >
                            <FontAwesome name="play-circle" size={20} color="#FFF" />
                            <Text style={styles.primaryButtonText}>Start Demo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Live Mode Card */}
                    <View style={[styles.card, styles.cardSecondary]}>
                        <View style={styles.cardHeader}>
                            <FontAwesome name="camera" size={20} color={MBTA_COLORS.green} />
                            <Text style={styles.cardTitle}>Live AR Mode</Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            Use your camera for real AR navigation. Requires a physical device
                            and development build.
                        </Text>

                        {/* Station Selection */}
                        <Text style={styles.selectLabel}>Select Station:</Text>
                        <View style={styles.stationGrid}>
                            {Object.entries(STATION_DATA).map(([id, station]) => (
                                <TouchableOpacity
                                    key={id}
                                    style={[
                                        styles.stationChip,
                                        selectedStation === id && styles.stationChipActive,
                                    ]}
                                    onPress={() => setSelectedStation(id as StationId)}
                                >
                                    <Text style={[
                                        styles.stationChipText,
                                        selectedStation === id && styles.stationChipTextActive,
                                    ]}>
                                        {station.name}
                                    </Text>
                                    <View style={styles.lineIndicators}>
                                        {station.lines.slice(0, 2).map((line, i) => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.lineIndicator,
                                                    { backgroundColor: getLineColor(line) },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.secondaryButton, !selectedStation && styles.buttonDisabled]}
                            onPress={() => selectedStation && setViewMode('ar-live')}
                            disabled={!selectedStation}
                        >
                            <FontAwesome name="camera" size={18} color="#FFF" />
                            <Text style={styles.secondaryButtonText}>Start AR Navigation</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <FontAwesome name="info-circle" size={16} color={MBTA_COLORS.navy} />
                        <Text style={styles.infoText}>
                            This feature uses on-device AI (Gemma 3 1B) for conversational
                            navigation guidance. Works offline!
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // AR View (Demo or Live)
    return (
        <View style={styles.arContainer}>
            <ARNavigator isDemoMode={viewMode === 'ar-demo'} />

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setViewMode('select')}
            >
                <FontAwesome name="arrow-left" size={18} color="#FFF" />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
}

function getLineColor(line: string): string {
    if (line.includes('Red')) return MBTA_COLORS.red;
    if (line.includes('Orange')) return MBTA_COLORS.orange;
    if (line.includes('Green')) return MBTA_COLORS.green;
    if (line.includes('Blue')) return MBTA_COLORS.blue;
    if (line.includes('Silver')) return MBTA_COLORS.silver;
    return MBTA_COLORS.purple;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MBTA_COLORS.background,
    },
    header: {
        backgroundColor: MBTA_COLORS.navy,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: MBTA_COLORS.navy,
        borderRadius: 16,
        padding: 20,
    },
    cardSecondary: {
        backgroundColor: 'rgba(28, 52, 95, 0.8)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        flex: 1,
    },
    recommendedBadge: {
        backgroundColor: MBTA_COLORS.orange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    recommendedText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 20,
        marginBottom: 16,
    },
    scenarioList: {
        gap: 8,
        marginBottom: 16,
    },
    scenarioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    scenarioIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(218, 41, 28, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scenarioInfo: {
        flex: 1,
    },
    scenarioName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scenarioStation: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 2,
    },
    primaryButton: {
        backgroundColor: MBTA_COLORS.orange,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: MBTA_COLORS.green,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
    },
    secondaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    selectLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    stationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    stationChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    stationChipActive: {
        backgroundColor: 'rgba(0, 132, 61, 0.3)',
        borderColor: MBTA_COLORS.green,
    },
    stationChipText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
    stationChipTextActive: {
        color: '#FFF',
    },
    lineIndicators: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 6,
    },
    lineIndicator: {
        width: 12,
        height: 4,
        borderRadius: 2,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        color: MBTA_COLORS.navy,
        fontSize: 13,
        lineHeight: 18,
    },
    arContainer: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
