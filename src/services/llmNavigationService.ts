/**
 * LLM Navigation Service using Cactus SDK
 * Provides on-device AI-powered navigation guidance
 */

import type { Direction } from '../data/demoScenarios';
import { MBTA_NAVIGATION_SYSTEM_PROMPT } from '../data/stationContext';

// Type definitions for Cactus SDK
interface CactusContext {
    completion: (params: { prompt: string; nPredict?: number; stop?: string[] }) => Promise<{ text: string }>;
    release: () => void;
}

interface CactusInitParams {
    model: string;
    n_ctx?: number;
    n_gpu_layers?: number;
}

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

export class LLMNavigationService {
    private context: CactusContext | null = null;
    private isInitialized: boolean = false;
    private isLoading: boolean = false;
    private modelPath: string;

    constructor(modelPath?: string) {
        // Default path - will need to be adjusted based on how we bundle the model
        this.modelPath = modelPath || 'gemma-3-1b-it-q4_0.gguf';
    }

    /**
     * Initialize the LLM - this loads the model into memory
     * Should be called once when the app starts or when entering AR mode
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;
        if (this.isLoading) return false;

        this.isLoading = true;

        try {
            // Dynamic import of Cactus - it's a native module
            // Note: cactus-react-native API may vary - this uses the common initLlama pattern
            const cactusModule = await import('cactus-react-native');

            // Try different initialization methods based on what's available
            const initFn = (cactusModule as any).initLlama ||
                (cactusModule as any).default?.initLlama ||
                (cactusModule as any).Cactus?.init;

            if (!initFn) {
                console.warn('[LLMNavigationService] Cactus SDK init function not found, using fallback mode');
                this.isLoading = false;
                return false;
            }

            // Initialize with the model
            this.context = await initFn({
                model: this.modelPath,
                n_ctx: 2048, // Context window
                n_gpu_layers: 0, // CPU only for broader compatibility
            } as CactusInitParams);

            this.isInitialized = true;
            this.isLoading = false;
            console.log('[LLMNavigationService] Model loaded successfully');
            return true;
        } catch (error) {
            console.error('[LLMNavigationService] Failed to initialize:', error);
            this.isLoading = false;
            return false;
        }
    }

    /**
     * Check if the service is ready to use
     */
    isReady(): boolean {
        return this.isInitialized && this.context !== null;
    }

    /**
     * Get navigation directions from the LLM
     */
    async getDirections(userQuery: string, stationContext?: string): Promise<NavigationResponse> {
        // If not initialized, return a fallback response
        if (!this.isReady()) {
            return this.getFallbackResponse(userQuery);
        }

        try {
            // Build the full prompt
            const systemPrompt = stationContext || MBTA_NAVIGATION_SYSTEM_PROMPT;
            const fullPrompt = `${systemPrompt}\n\nUser: ${userQuery}\nAssistant:`;

            // Get completion from the model
            const result = await this.context!.completion({
                prompt: fullPrompt,
                nPredict: 150, // Max tokens to generate
                stop: ['\n\n', 'User:', '\nUser'], // Stop sequences
            });

            const responseText = result.text.trim();
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
        if (lowerQuery.includes('exit') || lowerQuery.includes('out')) {
            return {
                text: 'Look for exit signs pointing to street level.',
                direction: 'up',
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
     * Release the model from memory
     */
    async release(): Promise<void> {
        if (this.context) {
            this.context.release();
            this.context = null;
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
