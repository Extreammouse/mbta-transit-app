import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MBTA_COLORS } from '../../constants/Colors';
import { getLLMNavigationService } from '../../src/services/llmNavigationService';
import { calculateConfidence, getSpeedDescription, simulateDelay } from '../../src/services/transfer-calc';
import { ConfidenceLevel, WalkingSpeed } from '../../src/types/mbta';
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge';

interface ScenarioSimulatorProps {
    originalBufferSeconds: number;
    walkingSpeed: WalkingSpeed;
    onSpeedChange: (speed: WalkingSpeed) => void;
    onDelayChange?: (delayMinutes: number) => void;
    onConfidenceChange?: (confidence: ConfidenceLevel) => void;
    originName?: string;
    destinationName?: string;
}

export function ScenarioSimulator({
    originalBufferSeconds,
    walkingSpeed,
    onSpeedChange,
    onDelayChange,
    onConfidenceChange,
    originName,
    destinationName,
}: ScenarioSimulatorProps) {
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [currentConfidence, setCurrentConfidence] = useState<ConfidenceLevel>(
        calculateConfidence(originalBufferSeconds)
    );
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasUserInteracted = useRef(false);
    const previousConfidence = useRef<ConfidenceLevel>(currentConfidence);

    // Update confidence when anything changes
    useEffect(() => {
        const { newConfidence } = simulateDelay(
            originalBufferSeconds,
            delayMinutes * 60
        );
        setCurrentConfidence(newConfidence);
        onConfidenceChange?.(newConfidence);

        // Update static response immediately
        setAiResponse(getStaticResponse(newConfidence));

        // Store for comparison
        previousConfidence.current = newConfidence;
    }, [originalBufferSeconds, delayMinutes]);

    // AI calls disabled - using static responses only for reliable offline experience
    // The gemma-3-1b model produces unreliable output
    // If you want to re-enable AI, uncomment the useEffect below
    /*
    useEffect(() => {
        if (!hasUserInteracted.current) {
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            getAIInsight(currentConfidence, delayMinutes);
        }, 1000);
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [delayMinutes, walkingSpeed]);
    */

    // Get AI-powered connection status
    const getAIInsight = async (confidence: ConfidenceLevel, delay: number) => {
        setAiLoading(true);
        try {
            const llmService = getLLMNavigationService();

            // Build context for AI
            let context = `Connection analysis: `;
            if (originName && destinationName) {
                context += `Traveling from ${originName} to ${destinationName}. `;
            }
            context += `Walking speed: ${walkingSpeed}. `;
            context += `Buffer time: ${Math.round(originalBufferSeconds / 60)} minutes. `;
            if (delay > 0) {
                context += `Delay: ${delay} minutes. `;
            }
            context += `Current connection confidence: ${confidence}. `;
            context += `Give a brief (1 sentence) tip about making this connection.`;

            const response = await llmService.getDirections(context);
            setAiResponse(response.text);
        } catch (error) {
            // Fall back to static response
            setAiResponse(getStaticResponse(confidence));
        } finally {
            setAiLoading(false);
        }
    };

    // Fallback static responses
    const getStaticResponse = (confidence: ConfidenceLevel): string => {
        if (confidence === 'likely') return 'You should make your connection comfortably.';
        if (confidence === 'risky') return 'Tight timing - be prepared to walk quickly.';
        return 'You may miss this connection. Consider alternatives.';
    };

    const handleDelayChange = (value: number) => {
        hasUserInteracted.current = true;
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
                            onPress={() => {
                                hasUserInteracted.current = true;
                                onSpeedChange(speed);
                            }}
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

            {/* AI-Powered Connection Status */}
            <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                    <Text style={styles.resultLabel}>Connection Status</Text>
                    <Ionicons name="sparkles" size={16} color={MBTA_COLORS.orange} />
                    <Text style={styles.aiLabel}>AI</Text>
                </View>
                <View style={styles.resultContent}>
                    <ConfidenceBadge confidence={currentConfidence} size="large" />
                    {aiLoading ? (
                        <View style={styles.aiLoadingContainer}>
                            <ActivityIndicator size="small" color={MBTA_COLORS.orange} />
                            <Text style={styles.aiLoadingText}>AI analyzing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.resultDescription}>
                            {aiResponse || getStaticResponse(currentConfidence)}
                        </Text>
                    )}
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
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    aiLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: MBTA_COLORS.orange,
        backgroundColor: 'rgba(237, 139, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    resultContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    aiLoadingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiLoadingText: {
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        fontStyle: 'italic',
    },
    resultDescription: {
        flex: 1,
        fontSize: 14,
        color: MBTA_COLORS.textLight,
        lineHeight: 20,
    },
});

export default ScenarioSimulator;
