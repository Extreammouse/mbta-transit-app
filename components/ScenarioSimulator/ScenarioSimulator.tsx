import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { MBTA_COLORS } from '../../constants/Colors';
import { ConfidenceLevel, WalkingSpeed } from '../../src/types/mbta';
import { simulateDelay, calculateConfidence, getSpeedDescription } from '../../src/services/transfer-calc';
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge';
import { Ionicons } from '@expo/vector-icons';

interface ScenarioSimulatorProps {
    originalBufferSeconds: number;
    walkingSpeed: WalkingSpeed;
    onSpeedChange: (speed: WalkingSpeed) => void;
    onDelayChange?: (delayMinutes: number) => void;
    onConfidenceChange?: (confidence: ConfidenceLevel) => void;
}

export function ScenarioSimulator({
    originalBufferSeconds,
    walkingSpeed,
    onSpeedChange,
    onDelayChange,
    onConfidenceChange,
}: ScenarioSimulatorProps) {
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [currentConfidence, setCurrentConfidence] = useState<ConfidenceLevel>(
        calculateConfidence(originalBufferSeconds)
    );

    useEffect(() => {
        const { newConfidence, newBuffer } = simulateDelay(
            originalBufferSeconds,
            delayMinutes * 60
        );
        setCurrentConfidence(newConfidence);
        onConfidenceChange?.(newConfidence);
    }, [delayMinutes, originalBufferSeconds]);

    const handleDelayChange = (value: number) => {
        const minutes = Math.round(value);
        setDelayMinutes(minutes);
        onDelayChange?.(minutes);
    };

    const speedOptions: WalkingSpeed[] = ['slow', 'normal', 'fast'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="flask" size={24} color={MBTA_COLORS.navy} />
                <Text style={styles.title}>What-If Scenarios</Text>
            </View>

            {/* Walking Speed Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Walking Speed</Text>
                <Text style={styles.sectionSubtitle}>
                    Adjust your walking pace to see how it affects transfer timing
                </Text>
                <View style={styles.speedButtons}>
                    {speedOptions.map((speed) => (
                        <TouchableOpacity
                            key={speed}
                            style={[
                                styles.speedButton,
                                walkingSpeed === speed && styles.speedButtonActive,
                            ]}
                            onPress={() => onSpeedChange(speed)}
                        >
                            <Ionicons
                                name={
                                    speed === 'slow' ? 'walk-outline' :
                                        speed === 'normal' ? 'walk' : 'flash'
                                }
                                size={20}
                                color={walkingSpeed === speed ? '#FFFFFF' : MBTA_COLORS.navy}
                            />
                            <Text
                                style={[
                                    styles.speedButtonText,
                                    walkingSpeed === speed && styles.speedButtonTextActive,
                                ]}
                            >
                                {speed.charAt(0).toUpperCase() + speed.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.speedDescription}>
                    {getSpeedDescription(walkingSpeed)}
                </Text>
            </View>

            {/* Delay Simulation Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Simulate Delay</Text>
                <Text style={styles.sectionSubtitle}>
                    What if you arrive late or there's a train delay?
                </Text>

                <View style={styles.delayContainer}>
                    <View style={styles.delayHeader}>
                        <Text style={styles.delayLabel}>Your delay:</Text>
                        <Text style={styles.delayValue}>
                            {delayMinutes === 0 ? 'On time' : `+${delayMinutes} min`}
                        </Text>
                    </View>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={15}
                        step={1}
                        value={delayMinutes}
                        onValueChange={handleDelayChange}
                        minimumTrackTintColor={MBTA_COLORS.navy}
                        maximumTrackTintColor="#E5E7EB"
                        thumbTintColor={MBTA_COLORS.navy}
                    />

                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>On time</Text>
                        <Text style={styles.sliderLabel}>+15 min</Text>
                    </View>
                </View>
            </View>

            {/* Result Preview */}
            <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Connection Status:</Text>
                <View style={styles.resultContent}>
                    <ConfidenceBadge confidence={currentConfidence} size="large" />
                    <Text style={styles.resultDescription}>
                        {currentConfidence === 'likely' && 'You should make your connection comfortably.'}
                        {currentConfidence === 'risky' && 'Tight timing - be prepared to walk quickly.'}
                        {currentConfidence === 'unlikely' && 'You may miss this connection. Consider alternatives.'}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: MBTA_COLORS.textLight,
        marginBottom: 12,
    },
    speedButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    speedButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    speedButtonActive: {
        backgroundColor: MBTA_COLORS.navy,
        borderColor: MBTA_COLORS.navy,
    },
    speedButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.navy,
    },
    speedButtonTextActive: {
        color: '#FFFFFF',
    },
    speedDescription: {
        fontSize: 13,
        color: MBTA_COLORS.textLight,
        textAlign: 'center',
        marginTop: 10,
    },
    delayContainer: {
        marginTop: 8,
    },
    delayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    delayLabel: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
    },
    delayValue: {
        fontSize: 18,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderLabel: {
        fontSize: 12,
        color: MBTA_COLORS.textLight,
    },
    resultSection: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginBottom: 12,
    },
    resultContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    resultDescription: {
        flex: 1,
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        lineHeight: 20,
    },
});

export default ScenarioSimulator;
