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
    ActivityIndicator,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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

// Dynamic camera types
type CameraPermissionStatus = 'undetermined' | 'granted' | 'denied';

export function ARNavigator({ isDemoMode = true, onClose }: ARNavigatorProps) {
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [chatCollapsed, setChatCollapsed] = useState(true); // Start collapsed
    const [showChat, setShowChat] = useState(false); // Toggle chat visibility
    const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('undetermined');
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [CameraView, setCameraView] = useState<React.ComponentType<any> | null>(null);

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

    // Initialize demo mode and LLM
    useEffect(() => {
        if (isDemoMode) {
            demoMode.enableDemo('park-to-red-sb');
        }
        // Initialize LLM in background
        llm.initialize();
    }, [isDemoMode]);

    // Load camera for ALL modes (including demo for real camera background)
    useEffect(() => {
        loadCameraAndRequestPermission();
    }, []);

    async function loadCameraAndRequestPermission() {
        setIsRequestingPermission(true);
        setCameraError(null);

        try {
            // Dynamically import expo-camera
            const cameraModule = await import('expo-camera');
            const { CameraView: CameraViewComponent, useCameraPermissions, Camera } = cameraModule;

            // Store the CameraView component
            setCameraView(() => CameraViewComponent);

            // Request permission
            const permissionResult = await Camera.requestCameraPermissionsAsync();

            if (permissionResult.granted) {
                setPermissionStatus('granted');
                setCameraReady(true);
            } else {
                setPermissionStatus('denied');
                setCameraError('Camera permission denied. Please enable it in settings.');
            }
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError('Camera not available: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setPermissionStatus('denied');
        } finally {
            setIsRequestingPermission(false);
        }
    }

    const handleSendMessage = async (text: string) => {
        await llm.sendMessage(text);
    };

    // Render camera or demo background
    const renderBackground = () => {
        // Try to show camera in all modes
        if (cameraReady && CameraView) {
            const CameraComponent = CameraView;
            return (
                <>
                    <CameraComponent
                        style={StyleSheet.absoluteFill}
                        facing="back"
                    />
                    {/* Demo overlay on top of camera */}
                    {isDemoMode && (
                        <View style={[StyleSheet.absoluteFill, styles.demoOverlay]}>
                            <Text style={styles.demoLabel}>📹 DEMO MODE - LIVE CAMERA</Text>
                        </View>
                    )}
                </>
            );
        }

        // AR mode - show camera or permission request
        if (isRequestingPermission) {
            return (
                <View style={styles.cameraPlaceholder}>
                    <ActivityIndicator size="large" color={MBTA_COLORS.green} />
                    <Text style={styles.cameraPlaceholderText}>Requesting camera permission...</Text>
                </View>
            );
        }

        if (permissionStatus === 'denied' || cameraError) {
            return (
                <View style={styles.cameraPlaceholder}>
                    <Text style={styles.cameraErrorText}>📷</Text>
                    <Text style={styles.cameraPlaceholderText}>
                        {cameraError || 'Camera permission required'}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadCameraAndRequestPermission}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (cameraReady && CameraView) {
            // Render actual camera
            const CameraComponent = CameraView;
            return (
                <CameraComponent
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />
            );
        }

        // Fallback
        return (
            <View style={styles.cameraPlaceholder}>
                <Text style={styles.cameraPlaceholderText}>Loading camera...</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background - Camera or Demo */}
            <View style={styles.cameraContainer}>
                {renderBackground()}
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

            {/* Chat Toggle Button */}
            <TouchableOpacity
                style={styles.chatToggleButton}
                onPress={() => setShowChat(!showChat)}
            >
                <Text style={styles.chatToggleText}>
                    {showChat ? '✕ Close Chat' : '💬 Ask AI'}
                </Text>
            </TouchableOpacity>

            {/* Chat Interface - Available in all modes */}
            {showChat && (
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
    cameraErrorText: {
        fontSize: 48,
        marginBottom: 16,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: MBTA_COLORS.green,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    demoOverlay: {
        backgroundColor: 'rgba(28, 52, 95, 0.2)',
    },
    chatToggleButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        backgroundColor: MBTA_COLORS.orange,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatToggleText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ARNavigator;
