/**
 * LLM Navigation Service using Cactus SDK
 * Provides on-device AI-powered navigation guidance
 */

import type { Direction } from '../data/demoScenarios';
import { MBTA_NAVIGATION_SYSTEM_PROMPT, getStationContext } from '../data/stationContext';

// Direction parsing from LLM response
const DIRECTION_PATTERNS: Record<Direction, RegExp> = {
    straight: /\[STRAIGHT\]/i,
    left: /\[LEFT\]/i,
    right: /\[RIGHT\]/i,
    back: /\[BACK\]/i,
    up: /\[UP\]/i,
    down: /\[DOWN\]/i,
    arrived: /\[ARRIVED\]/i,
};

export interface NavigationResponse {
    text: string;
    direction: Direction | null;
    confidence: number;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export class LLMNavigationService {
    private cactusLM: any = null;
    private isInitialized: boolean = false;
    private isLoading: boolean = false;
    private initError: string | null = null;
    private conversationHistory: Message[] = [];

    constructor() {
        // Initialize with system prompt
        this.conversationHistory = [{
            role: 'system',
            content: MBTA_NAVIGATION_SYSTEM_PROMPT
        }];
    }

    /**
     * Initialize the LLM - this loads the model into memory
     * Should be called once when the app starts or when entering AR mode
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;
        if (this.isLoading) return false;

        this.isLoading = true;
        this.initError = null;

        try {
            console.log('[LLMNavigationService] Starting initialization...');

            // Import the Cactus SDK
            const { CactusLM } = await import('cactus-react-native');

            // Create CactusLM instance
            // Using Cactus's built-in gemma-3-1b-it model (320MB int4)
            this.cactusLM = new CactusLM({
                model: 'gemma-3-1b-it', // Correct model name from Cactus SDK
                contextSize: 2048,
                options: {
                    quantization: 'int4' // Use int4 for smaller size (320MB)
                }
            });

            console.log('[LLMNavigationService] CactusLM instance created');

            // Download the model if not already downloaded
            console.log('[LLMNavigationService] Checking/downloading model...');
            await this.cactusLM.download({
                onProgress: (progress: number) => {
                    console.log(`[LLMNavigationService] Download progress: ${(progress * 100).toFixed(1)}%`);
                }
            });

            console.log('[LLMNavigationService] Model downloaded, initializing...');

            // Initialize the model
            await this.cactusLM.init();

            this.isInitialized = true;
            this.isLoading = false;
            console.log('[LLMNavigationService] Model initialized successfully');
            return true;
        } catch (error) {
            console.error('[LLMNavigationService] Failed to initialize:', error);
            this.initError = error instanceof Error ? error.message : 'Unknown error';
            this.isLoading = false;
            return false;
        }
    }

    /**
     * Check if the service is ready to use
     */
    isReady(): boolean {
        return this.isInitialized && this.cactusLM !== null;
    }

    /**
     * Get initialization error message
     */
    getInitError(): string | null {
        return this.initError;
    }

    /**
     * Check if currently loading
     */
    isModelLoading(): boolean {
        return this.isLoading;
    }

    /**
     * Get navigation directions from the LLM
     */
    async getDirections(userQuery: string, stationId?: string): Promise<NavigationResponse> {
        // If not initialized, return a fallback response
        if (!this.isReady()) {
            console.log('[LLMNavigationService] Not ready, using fallback');
            return this.getFallbackResponse(userQuery);
        }

        try {
            // Add station context if provided
            if (stationId) {
                const stationContext = getStationContext(stationId as any);
                if (stationContext) {
                    // Update system message with specific station info
                    this.conversationHistory[0] = {
                        role: 'system',
                        content: stationContext.details
                    };
                }
            }

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userQuery
            });

            console.log('[LLMNavigationService] Sending query:', userQuery);

            // Get completion from the model
            const result = await this.cactusLM.complete({
                messages: this.conversationHistory,
                options: {
                    maxTokens: 150,
                    temperature: 0.7,
                    stopSequences: ['\n\n', 'User:'],
                }
            });

            const responseText = result.response || '';
            console.log('[LLMNavigationService] Response:', responseText);

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: responseText
            });

            // Keep history manageable (last 10 messages + system)
            if (this.conversationHistory.length > 11) {
                this.conversationHistory = [
                    this.conversationHistory[0], // Keep system prompt
                    ...this.conversationHistory.slice(-10)
                ];
            }

            const direction = this.parseDirection(responseText);

            return {
                text: this.cleanResponse(responseText),
                direction,
                confidence: direction ? 0.9 : 0.5,
            };
        } catch (error) {
            console.error('[LLMNavigationService] Error getting directions:', error);
            return this.getFallbackResponse(userQuery);
        }
    }

    /**
     * Parse direction tag from LLM response
     */
    private parseDirection(text: string): Direction | null {
        for (const [direction, pattern] of Object.entries(DIRECTION_PATTERNS)) {
            if (pattern.test(text)) {
                return direction as Direction;
            }
        }
        return null;
    }

    /**
     * Clean up the response text (remove direction tags for display)
     */
    private cleanResponse(text: string): string {
        let cleaned = text;
        for (const pattern of Object.values(DIRECTION_PATTERNS)) {
            cleaned = cleaned.replace(pattern, '');
        }
        return cleaned.trim();
    }

    /**
     * Fallback responses when LLM isn't available
     */
    private getFallbackResponse(query: string): NavigationResponse {
        const lowerQuery = query.toLowerCase();

        // Simple keyword matching for fallback
        if (lowerQuery.includes('red line')) {
            return {
                text: 'To find the Red Line, look for the red signs and head toward the stairs going down.',
                direction: 'straight',
                confidence: 0.6,
            };
        }
        if (lowerQuery.includes('green line')) {
            return {
                text: 'The Green Line is on the same level as the fare gates. Look for green signs.',
                direction: 'straight',
                confidence: 0.6,
            };
        }
        if (lowerQuery.includes('orange line')) {
            return {
                text: 'Follow the orange signs to find the Orange Line.',
                direction: 'straight',
                confidence: 0.6,
            };
        }
        if (lowerQuery.includes('blue line')) {
            return {
                text: 'Follow the blue signs to find the Blue Line.',
                direction: 'straight',
                confidence: 0.6,
            };
        }
        if (lowerQuery.includes('exit') || lowerQuery.includes('out')) {
            return {
                text: 'Look for exit signs pointing to street level.',
                direction: 'up',
                confidence: 0.6,
            };
        }
        if (lowerQuery.includes('stair') || lowerQuery.includes('up')) {
            return {
                text: 'Stairs are typically near the ends of the platform.',
                direction: 'straight',
                confidence: 0.6,
            };
        }

        return {
            text: 'I can help you navigate. Try asking about a specific line like "Where is the Red Line?" or "How do I exit?"',
            direction: null,
            confidence: 0.3,
        };
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [{
            role: 'system',
            content: MBTA_NAVIGATION_SYSTEM_PROMPT
        }];
    }

    /**
     * Release the model from memory
     */
    async release(): Promise<void> {
        if (this.cactusLM) {
            try {
                await this.cactusLM.destroy();
            } catch (e) {
                console.error('[LLMNavigationService] Error releasing:', e);
            }
            this.cactusLM = null;
            this.isInitialized = false;
        }
    }
}

// Singleton instance for the app
let serviceInstance: LLMNavigationService | null = null;

export function getLLMNavigationService(): LLMNavigationService {
    if (!serviceInstance) {
        serviceInstance = new LLMNavigationService();
    }
    return serviceInstance;
}

export default LLMNavigationService;
