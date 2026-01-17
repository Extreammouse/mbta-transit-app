/**
 * Demo Mode Hook
 * Provides simulated navigation for stage presentations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_SCENARIOS, getScenarioById, type DemoScenario, type DemoStep, type Direction } from '../data/demoScenarios';

export interface DemoModeState {
    // State
    isEnabled: boolean;
    isPlaying: boolean;
    currentStepIndex: number;
    currentStep: DemoStep | null;
    scenario: DemoScenario | null;
    simulatedHeading: number; // 0-360 degrees

    // Derived
    totalSteps: number;
    progress: number; // 0-100
    currentDirection: Direction | null;
    currentInstruction: string;
    aiResponse: string;
    isComplete: boolean;

    // Controls
    enableDemo: (scenarioId?: string) => void;
    disableDemo: () => void;
    selectScenario: (scenarioId: string) => void;
    play: () => void;
    pause: () => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
    setSimulatedHeading: (heading: number) => void;

    // Available scenarios
    availableScenarios: DemoScenario[];
}

export function useDemoMode(): DemoModeState {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [scenarioId, setScenarioId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [simulatedHeading, setSimulatedHeading] = useState(0);

    const playIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get current scenario
    const scenario = scenarioId ? getScenarioById(scenarioId) ?? null : null;
    const currentStep = scenario?.steps[currentStepIndex] || null;
    const totalSteps = scenario?.steps.length || 0;
    const isComplete = currentStepIndex >= totalSteps - 1;

    // Clear interval on unmount
    useEffect(() => {
        return () => {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        };
    }, []);

    // Auto-advance when playing
    useEffect(() => {
        if (isPlaying && currentStep && currentStep.duration > 0 && !isComplete) {
            playIntervalRef.current = setTimeout(() => {
                setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
            }, currentStep.duration * 1000);

            return () => {
                if (playIntervalRef.current) {
                    clearTimeout(playIntervalRef.current);
                }
            };
        }
    }, [isPlaying, currentStepIndex, currentStep, totalSteps, isComplete]);

    // Auto-pause when complete
    useEffect(() => {
        if (isComplete) {
            setIsPlaying(false);
        }
    }, [isComplete]);

    const enableDemo = useCallback((defaultScenarioId?: string) => {
        setIsEnabled(true);
        if (defaultScenarioId) {
            setScenarioId(defaultScenarioId);
        } else if (DEMO_SCENARIOS.length > 0) {
            setScenarioId(DEMO_SCENARIOS[0].id);
        }
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    const disableDemo = useCallback(() => {
        setIsEnabled(false);
        setIsPlaying(false);
        setScenarioId(null);
        setCurrentStepIndex(0);
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
        }
    }, []);

    const selectScenario = useCallback((id: string) => {
        setScenarioId(id);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    const play = useCallback(() => {
        if (!isComplete) {
            setIsPlaying(true);
        }
    }, [isComplete]);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
    }, [totalSteps]);

    const prevStep = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const reset = useCallback(() => {
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    return {
        // State
        isEnabled,
        isPlaying,
        currentStepIndex,
        currentStep,
        scenario,
        simulatedHeading,

        // Derived
        totalSteps,
        progress: totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0,
        currentDirection: currentStep?.direction || null,
        currentInstruction: currentStep?.instruction || 'Select a scenario to begin',
        aiResponse: currentStep?.aiResponse || '',
        isComplete,

        // Controls
        enableDemo,
        disableDemo,
        selectScenario,
        play,
        pause,
        nextStep,
        prevStep,
        reset,
        setSimulatedHeading,

        // Available scenarios
        availableScenarios: DEMO_SCENARIOS,
    };
}

export default useDemoMode;
