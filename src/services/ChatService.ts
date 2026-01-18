import NetInfo from '@react-native-community/netinfo';
import { offlineService } from './OfflineScheduleService';
import { mbtaApi } from './mbta-api';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

class ChatService {

    async sendMessage(userMessage: string): Promise<string> {
        const state = await NetInfo.fetch();
        const isOnline = state.isConnected && state.isInternetReachable !== false;

        if (isOnline) {
            return this.handleOnlineQuery(userMessage);
        } else {
            return this.handleOfflineQuery(userMessage);
        }
    }

    private async handleOnlineQuery(message: string): Promise<string> {
        try {
            // Simple heuristic intent parsing for demonstration
            // "Next train to [Station Name]"
            const nextTrainMatch = message.match(/next train to (.+)/i);

            if (nextTrainMatch) {
                const destName = nextTrainMatch[1].trim();
                // 1. Find the stop ID (we need to fetch all stops or search)
                // For efficiency in this demo, let's search in our internal list if possible, 
                // or just fetch all stops and filter.
                const stops = await mbtaApi.getStops(); // Fetching all stops might be heavy, but okay for online demo
                const stop = stops.find(s => s.attributes.name.toLowerCase().includes(destName.toLowerCase()));

                if (!stop) {
                    return `I couldn't find a station named "${destName}".`;
                }

                const predictions = await mbtaApi.getPredictions(stop.id);

                if (predictions.length === 0) {
                    return `I found ${stop.attributes.name}, but there are no upcoming predictions right now.`;
                }

                // Format the first few predictions
                const nextPreds = predictions.slice(0, 3).map(p => {
                    const time = p.attributes.arrival_time ? new Date(p.attributes.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Arriving';
                    return `${time}`;
                }).join(', ');

                return `Next trains at ${stop.attributes.name}: ${nextPreds}`;
            }

            return "I'm online using the official MBTA API! currently I only understand 'Next train to [Station Name]'.";

        } catch (error: any) {
            console.error("Online Error", error);
            return `I encountered an error fetching live data: ${error.message}`;
        }
    }

    private async handleOfflineQuery(message: string): Promise<string> {
        try {
            // 1. Initialize DB if needed
            await offlineService.initialize();

            // 2. Mock SLM Translation (In a real app, this would call a local model)
            // We will parse the same basic pattern "Next train to [Station Name]" to SQL
            const nextTrainMatch = message.match(/next train to (.+)/i);

            if (nextTrainMatch) {
                const destName = nextTrainMatch[1].trim();
                const systemPrompt = offlineService.getSystemPrompt(); // Get context (day, time)
                const today = offlineService.getCurrentServiceDay();
                const now = new Date();
                const currentTime = now.toTimeString().split(' ')[0];

                // GENERIC SQL generated "by the SLM"
                const sql = `
          SELECT DISTINCT st.arrival_time, s.stop_name, t.trip_headsign
          FROM stop_times st
          JOIN stops s ON st.stop_id = s.stop_id
          JOIN trips t ON st.trip_id = t.trip_id
          JOIN calendar c ON t.service_id = c.service_id
          WHERE s.stop_name LIKE '%${destName}%'
            AND c.${today} = 1
            AND st.arrival_time > '${currentTime}'
          ORDER BY st.arrival_time ASC
          LIMIT 5;
        `;

                const results = await offlineService.executeQuery(sql);

                if (results.length === 0) {
                    return `[Offline] No scheduled trains found for "${destName}" after ${currentTime}.`;
                }

                // Format: "12:00 (to Alewife)"
                const times = results.map((r: any) => {
                    const time = r.arrival_time.substring(0, 5);
                    return `${time} (to ${r.trip_headsign})`;
                }).join(', ');

                return `[Offline] Scheduled at ${results[0].stop_name}: ${times}`;
            }

            return "I'm offline. I can check schedules locally. Try 'Next train to South Station'.";

        } catch (error: any) {
            console.error("Offline Error", error);
            return `I had trouble accessing the offline schedule database. Error: ${error.message}`;
        }
    }
}

export const chatService = new ChatService();
