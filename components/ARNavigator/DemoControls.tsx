/**
 * Demo Controls Component
 * Control panel for demo mode - allows stepping through scenarios
 */

import { MBTA_COLORS } from '@/constants/Colors';
import type { DemoScenario } from '@/src/data/demoScenarios';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DemoControlsProps {
    isPlaying: boolean;
    currentStep: number;
    totalSteps: number;
    scenario: DemoScenario | null;
    availableScenarios: DemoScenario[];
    onPlay: () => void;
    onPause: () => void;
    onNextStep: () => void;
    onPrevStep: () => void;
    onReset: () => void;
    onSelectScenario: (id: string) => void;
    isComplete: boolean;
}

export function DemoControls({
    isPlaying,
    currentStep,
    totalSteps,
    scenario,
    availableScenarios,
    onPlay,
    onPause,
    onNextStep,
    onPrevStep,
    onReset,
    onSelectScenario,
    isComplete,
}: DemoControlsProps) {
    return (
        <View style={styles.container}>
            {/* Scenario Selector */}
            <View style={styles.scenarioSection}>
                <Text style={styles.sectionLabel}>Demo Scenario:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenarioScroll}>
                    {availableScenarios.map((s) => (
                        <TouchableOpacity
                            key={s.id}
                            style={[
                                styles.scenarioChip,
                                scenario?.id === s.id && styles.scenarioChipActive,
                            ]}
                            onPress={() => onSelectScenario(s.id)}
                        >
                            <Text
                                style={[
                                    styles.scenarioChipText,
                                    scenario?.id === s.id && styles.scenarioChipTextActive,
                                ]}
                                numberOfLines={1}
                            >
                                {s.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(currentStep / Math.max(totalSteps - 1, 1)) * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    Step {currentStep + 1} of {totalSteps}
                </Text>
            </View>

            {/* Playback Controls */}
            <View style={styles.controlsRow}>
                {/* Reset */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onReset}
                    disabled={currentStep === 0}
                >
                    <FontAwesome
                        name="refresh"
                        size={20}
                        color={currentStep === 0 ? '#999' : '#FFF'}
                    />
                </TouchableOpacity>

                {/* Previous */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onPrevStep}
                    disabled={currentStep === 0}
                >
                    <FontAwesome
                        name="step-backward"
                        size={20}
                        color={currentStep === 0 ? '#999' : '#FFF'}
                    />
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.playButton]}
                    onPress={isPlaying ? onPause : onPlay}
                    disabled={isComplete}
                >
                    <FontAwesome
                        name={isPlaying ? 'pause' : 'play'}
                        size={24}
                        color={isComplete ? '#999' : '#FFF'}
                    />
                </TouchableOpacity>

                {/* Next */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onNextStep}
                    disabled={isComplete}
                >
                    <FontAwesome
                        name="step-forward"
                        size={20}
                        color={isComplete ? '#999' : '#FFF'}
                    />
                </TouchableOpacity>

                {/* Manual Step (prominent) */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.stepButton]}
                    onPress={onNextStep}
                    disabled={isComplete}
                >
                    <Text style={styles.stepButtonText}>
                        {isComplete ? 'Done!' : 'Next →'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Info Text */}
            {scenario && (
                <Text style={styles.infoText}>{scenario.description}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(28, 52, 95, 0.95)',
        paddingTop: 16,
        paddingBottom: 34, // Account for home indicator
        paddingHorizontal: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    scenarioSection: {
        marginBottom: 12,
    },
    sectionLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600',
    },
    scenarioScroll: {
        flexDirection: 'row',
    },
    scenarioChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scenarioChipActive: {
        backgroundColor: MBTA_COLORS.green,
        borderColor: MBTA_COLORS.green,
    },
    scenarioChipText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
    scenarioChipTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: MBTA_COLORS.green,
        borderRadius: 2,
    },
    progressText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: MBTA_COLORS.green,
    },
    stepButton: {
        width: 80,
        backgroundColor: MBTA_COLORS.orange,
    },
    stepButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    infoText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
    },
});

export default DemoControls;
