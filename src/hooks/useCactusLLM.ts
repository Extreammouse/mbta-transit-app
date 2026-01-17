/**
 * Cactus LLM Hook
 * Provides React hook interface to the LLM navigation service
 */

import { useCallback, useEffect, useState } from 'react';
import type { Direction } from '../data/demoScenarios';
import { getLLMNavigationService, type NavigationResponse } from '../services/llmNavigationService';

export interface UseCactusLLMState {
    // Status
    isLoading: boolean;
    isModelLoaded: boolean;
    isGenerating: boolean;
    error: string | null;

    // Conversation
    messages: Message[];
    currentDirection: Direction | null;

    // Actions
    initialize: () => Promise<boolean>;
    sendMessage: (text: string) => Promise<NavigationResponse>;
    clearMessages: () => void;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    direction?: Direction | null;
    timestamp: Date;
}

export function useCactusLLM(): UseCactusLLMState {
    const [isLoading, setIsLoading] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);

    const service = getLLMNavigationService();

    // Initialize the model
    const initialize = useCallback(async (): Promise<boolean> => {
        if (isModelLoaded) return true;

        setIsLoading(true);
        setError(null);

        try {
            const success = await service.initialize();
            setIsModelLoaded(success);

            if (!success) {
                setError('Failed to load AI model. Using fallback responses.');
            }

            return success;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error loading model';
            setError(message);
            setIsModelLoaded(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isModelLoaded, service]);

    // Send a message to the LLM
    const sendMessage = useCallback(async (text: string): Promise<NavigationResponse> => {
        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsGenerating(true);
        setError(null);

        try {
            // Try to initialize if not already
            if (!service.isReady()) {
                await service.initialize();
            }

            // Get response
            const response = await service.getDirections(text);

            // Add assistant message
            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                text: response.text,
                direction: response.direction,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
            setCurrentDirection(response.direction);

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error generating response';
            setError(errorMessage);

            // Return fallback response
            const fallback: NavigationResponse = {
                text: 'Sorry, I had trouble processing that. Please try again.',
                direction: null,
                confidence: 0,
            };

            const errorAssistantMessage: Message = {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                text: fallback.text,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorAssistantMessage]);

            return fallback;
        } finally {
            setIsGenerating(false);
        }
    }, [service]);

    // Clear conversation
    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentDirection(null);
        service.clearHistory();
    }, [service]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't release the model on unmount - keep it hot for quick responses
            // service.release();
        };
    }, [service]);

    return {
        isLoading,
        isModelLoaded,
        isGenerating,
        error,
        messages,
        currentDirection,
        initialize,
        sendMessage,
        clearMessages,
    };
}

export default useCactusLLM;
