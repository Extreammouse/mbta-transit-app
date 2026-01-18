import { Asset } from 'expo-asset';
// Use legacy import as per Expo 52+ warning for getInfoAsync
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'mbta_offline.db';

export class OfflineScheduleService {
    private db: SQLite.SQLiteDatabase | null = null;
    private isReady: boolean = false;

    constructor() { }

    async initialize(): Promise<void> {
        if (this.isReady && this.db) return;

        try {
            // 1. Check if DB exists in document directory
            const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
            const dbDir = `${FileSystem.documentDirectory}SQLite`;

            // Make sure SQLite directory exists
            if (!(await FileSystem.getInfoAsync(dbDir)).exists) {
                await FileSystem.makeDirectoryAsync(dbDir);
            }

            const fileInfo = await FileSystem.getInfoAsync(dbPath);

            // 2. If not, copy it from assets
            if (!fileInfo.exists) {
                console.log('Database not found in doc dir, copying from assets...');
                const asset = Asset.fromModule(require('../../assets/mbta_offline.db'));
                await asset.downloadAsync();

                if (!asset.localUri) {
                    throw new Error('Failed to download asset to local URI');
                }

                await FileSystem.copyAsync({
                    from: asset.localUri,
                    to: dbPath,
                });
                console.log('Database copied successfully.');
            }

            // 3. Open Database
            this.db = await SQLite.openDatabaseAsync(DB_NAME);
            this.isReady = true;
            console.log('Offline Database Initialized.');

        } catch (error) {
            console.error('Failed to initialize offline database:', error);
            throw error;
        }
    }

    async executeQuery(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.isReady || !this.db) {
            await this.initialize();
        }
        if (!this.db) throw new Error("Database not initialized");

        try {
            const result = await this.db.getAllAsync(sql, params);
            return result;
        } catch (error) {
            console.error('SQL Execution Error:', error);
            throw error;
        }
    }

    getCurrentServiceDay(): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = new Date();
        return days[today.getDay()];
    }

    getSystemPrompt(): string {
        const today = this.getCurrentServiceDay();
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        return `
You are an expert SQL assistant for the MBTA Transit App. Access the local SQLite database to answer user questions about schedules.

Database Schema:
- stops (stop_id, stop_name, stop_lat, stop_lon)
- routes (route_id, route_short_name, route_long_name, route_type)
- calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date)
- trips (trip_id, route_id, service_id, trip_headsign, direction_id)
- stop_times (trip_id, arrival_time (HH:MM:SS), departure_time, stop_id, stop_sequence)

Current Context:
- Day of week: '${today}'
- Current Time: '${currentTime}'
- Current Date: '${currentDate}'

Instructions:
1. Generate ONLY the SQL query to answer the user's question. Do not explain.
2. ALWAYS join with the 'calendar' table to ensure the 'service_id' is active for TODAY ('${today}' = 1).
3. Filter by current time (arrival_time > '${currentTime}') for "next" or "upcoming" queries.
4. Join 'stops' to filter by station names (use LIKE for partial matches).
5. Join 'routes' if route info is needed.
6. Limit results to 5 unless specified otherwise.
7. Order by arrival_time ASC for chronological results.

Example Question: "Next train to South Station?"
Example SQL:
SELECT t.trip_headsign, st.arrival_time, r.route_short_name 
FROM stop_times st
JOIN trips t ON st.trip_id = t.trip_id
JOIN stops s ON st.stop_id = s.stop_id
JOIN calendar c ON t.service_id = c.service_id
JOIN routes r ON t.route_id = r.route_id
WHERE s.stop_name LIKE '%South Station%'
  AND c.${today} = 1
  AND st.arrival_time > '${currentTime}'
ORDER BY st.arrival_time ASC
LIMIT 5;
`;
    }
}

export const offlineService = new OfflineScheduleService();
