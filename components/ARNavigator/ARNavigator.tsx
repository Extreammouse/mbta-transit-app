/**
 * AR Navigator Component
 * Main AR navigation view with camera, arrow overlay, and chat interface
 */

import { MBTA_COLORS } from '@/constants/Colors';
import type { Direction } from '@/src/data/demoScenarios';
import { useCactusLLM } from '@/src/hooks/useCactusLLM';
import { useDemoMode } from '@/src/hooks/useDemoMode';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { ChatInterface } from './ChatInterface';
import { DemoControls } from './DemoControls';
import { DirectionArrow } from './DirectionArrow';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ARNavigatorProps {
    isDemoMode?: boolean;
    onClose?: () => void;
}

// Camera component - dynamically imported
let CameraComponent: React.ComponentType<any> | null = null;

export function ARNavigator({ isDemoMode = true, onClose }: ARNavigatorProps) {
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [chatCollapsed, setChatCollapsed] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // Demo mode state  
    const demoMode = useDemoMode();

    // LLM state
    const llm = useCactusLLM();

    // Current direction to display (from demo mode or LLM)
    const currentDirection: Direction | null = isDemoMode
        ? demoMode.currentDirection
        : llm.currentDirection;

    // Current instruction text
    const currentInstruction: string = isDemoMode
        ? demoMode.aiResponse || demoMode.currentInstruction
        : llm.messages.length > 0
            ? llm.messages[llm.messages.length - 1].text
            : 'Ask for directions to get started';

    // Pulse animation for instruction
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1000 }),
                withTiming(1, { duration: 1000 }),
            ),
            -1,
            true
        );
    }, [pulse]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    // Initialize demo mode
    useEffect(() => {
        if (isDemoMode) {
            demoMode.enableDemo('park-to-red-sb');
        }
        // Initialize LLM in background
        llm.initialize();
    }, [isDemoMode]);

    // Try to load camera for real mode
    useEffect(() => {
        if (!isDemoMode) {
            loadCamera();
        }
    }, [isDemoMode]);

    async function loadCamera() {
        try {
            const { CameraView, useCameraPermissions } = await import('expo-camera');
            CameraComponent = CameraView;

            // Request permissions would happen here
            setCameraReady(true);
        } catch (err) {
            console.log('Camera not available:', err);
            setCameraError('Camera not available. Using demo mode.');
        }
    }

    const handleSendMessage = async (text: string) => {
        await llm.sendMessage(text);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background - Camera or Demo Image */}
            <View style={styles.cameraContainer}>
                {isDemoMode || !showCamera ? (
                    // Demo mode background - stylized subway station image pattern
                    <View style={styles.demoBackground}>
                        <View style={styles.demoBackgroundOverlay} />
                        <View style={styles.demoGrid}>
                            {/* Create a grid pattern to simulate depth */}
                            {[...Array(8)].map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.gridLine,
                                        { top: `${12.5 * i}%`, opacity: 0.1 + (i * 0.05) }
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={styles.demoLabel}>📹 DEMO MODE</Text>
                    </View>
                ) : (
                    // Real camera view
                    <View style={styles.cameraPlaceholder}>
                        <Text style={styles.cameraPlaceholderText}>Camera View</Text>
                    </View>
                )}
            </View>

            {/* Instruction Banner */}
            <Animated.View style={[styles.instructionBanner, pulseStyle]}>
                <Text style={styles.instructionText}>{currentInstruction}</Text>
                {isDemoMode && demoMode.scenario && (
                    <Text style={styles.stationLabel}>
                        📍 {demoMode.scenario.station} Station
                    </Text>
                )}
            </Animated.View>

            {/* Direction Arrow */}
            <DirectionArrow
                direction={currentDirection}
                size="large"
                color={currentDirection === 'arrived' ? MBTA_COLORS.green : MBTA_COLORS.red}
                showGlow={true}
            />

            {/* Distance / Progress Indicator */}
            {isDemoMode && demoMode.currentStep && (
                <View style={styles.distanceIndicator}>
                    {demoMode.currentStep.distance > 0 && (
                        <Text style={styles.distanceText}>
                            {demoMode.currentStep.distance}m
                        </Text>
                    )}
                    <Text style={styles.directionLabel}>
                        {demoMode.currentStep.direction.toUpperCase()}
                    </Text>
                </View>
            )}

            {/* Chat Interface */}
            {!isDemoMode && (
                <View style={styles.chatContainer}>
                    <ChatInterface
                        messages={llm.messages}
                        onSendMessage={handleSendMessage}
                        isLoading={llm.isLoading}
                        isGenerating={llm.isGenerating}
                        collapsed={chatCollapsed}
                        onToggleCollapse={() => setChatCollapsed(!chatCollapsed)}
                    />
                </View>
            )}

            {/* Demo Controls */}
            {isDemoMode && (
                <DemoControls
                    isPlaying={demoMode.isPlaying}
                    currentStep={demoMode.currentStepIndex}
                    totalSteps={demoMode.totalSteps}
                    scenario={demoMode.scenario}
                    availableScenarios={demoMode.availableScenarios}
                    onPlay={demoMode.play}
                    onPause={demoMode.pause}
                    onNextStep={demoMode.nextStep}
                    onPrevStep={demoMode.prevStep}
                    onReset={demoMode.reset}
                    onSelectScenario={demoMode.selectScenario}
                    isComplete={demoMode.isComplete}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    demoBackground: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    demoBackgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(28, 52, 95, 0.3)',
    },
    demoGrid: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#FFF',
    },
    demoLabel: {
        position: 'absolute',
        top: 60,
        right: 16,
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
    },
    cameraPlaceholderText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
    },
    instructionBanner: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(28, 52, 95, 0.9)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    instructionText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
    },
    stationLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 8,
    },
    distanceIndicator: {
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.55,
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    distanceText: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '700',
    },
    directionLabel: {
        color: MBTA_COLORS.green,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    chatContainer: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
    },
});

export default ARNavigator;
