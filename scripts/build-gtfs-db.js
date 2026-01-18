const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { parse } = require('csv-parse/sync');

const ASSETS_DIR = path.join(__dirname, '../assets');
const GTFS_DIR = path.join(ASSETS_DIR, 'MBTA_GTFS');
const DB_PATH = path.join(ASSETS_DIR, 'mbta_offline.db');

// Delete existing DB if it exists
if (fs.existsSync(DB_PATH)) {
    console.log('Removing existing database...');
    fs.unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('Creating schema...');

db.exec(`
  CREATE TABLE stops (
    stop_id TEXT PRIMARY KEY,
    stop_name TEXT,
    stop_lat REAL,
    stop_lon REAL
  );

  CREATE TABLE routes (
    route_id TEXT PRIMARY KEY,
    route_short_name TEXT,
    route_long_name TEXT,
    route_type INTEGER
  );

  CREATE TABLE calendar (
    service_id TEXT PRIMARY KEY,
    monday INTEGER,
    tuesday INTEGER,
    wednesday INTEGER,
    thursday INTEGER,
    friday INTEGER,
    saturday INTEGER,
    sunday INTEGER,
    start_date TEXT,
    end_date TEXT
  );

  CREATE TABLE trips (
    trip_id TEXT PRIMARY KEY,
    route_id TEXT,
    service_id TEXT,
    trip_headsign TEXT,
    direction_id INTEGER,
    FOREIGN KEY(route_id) REFERENCES routes(route_id),
    FOREIGN KEY(service_id) REFERENCES calendar(service_id)
  );

  CREATE TABLE stop_times (
    trip_id TEXT,
    arrival_time TEXT,
    departure_time TEXT,
    stop_id TEXT,
    stop_sequence INTEGER,
    FOREIGN KEY(trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY(stop_id) REFERENCES stops(stop_id)
  );

  CREATE INDEX idx_stop_name ON stops(stop_name);
  CREATE INDEX idx_arrival_time ON stop_times(arrival_time);
  CREATE INDEX idx_stop_times_stop_id ON stop_times(stop_id);
  CREATE INDEX idx_trips_route_id ON trips(route_id);
  CREATE INDEX idx_trips_service_id ON trips(service_id);
`);

function importTable(fileName, tableName, columns) {
    const filePath = path.join(GTFS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${fileName} not found. Skipping.`);
        return;
    }

    console.log(`Importing ${tableName} from ${fileName}...`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
    });

    if (records.length === 0) return;

    const placeholders = columns.map(() => '?').join(',');
    const insert = db.prepare(`INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`);

    const insertMany = db.transaction((rows) => {
        for (const row of rows) {
            const values = columns.map(col => row[col] !== undefined ? row[col] : null);
            try {
                insert.run(values);
            } catch (err) {
                // Ignore constraint violations (duplicates), log others
                if (!err.message.includes('UNIQUE constraint failed')) {
                    console.error(`Error inserting into ${tableName}:`, err.message);
                }
            }
        }
    });

    insertMany(records);
    console.log(`Imported ${records.length} records into ${tableName}.`);
}

// 1. Import Stops (Partial fields)
importTable('stops.txt', 'stops', ['stop_id', 'stop_name', 'stop_lat', 'stop_lon']);

// 2. Import Routes (Partial fields)
importTable('routes.txt', 'routes', ['route_id', 'route_short_name', 'route_long_name', 'route_type']);

// 3. Import Calendar
importTable('calendar.txt', 'calendar', [
    'service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'start_date', 'end_date'
]);

// 4. Import Trips
importTable('trips.txt', 'trips', ['trip_id', 'route_id', 'service_id', 'trip_headsign', 'direction_id']);

// 5. Import Stop Times (This is the big one!)
// Note: stop_times.txt is huge. Reading it all into memory with fs.readFileSync might fail on low-memory envs,
// but for a desktop dev environment it should be okay. If it fails, we need a stream.
// Also only importing relevant columns.
importTable('stop_times.txt', 'stop_times', ['trip_id', 'arrival_time', 'departure_time', 'stop_id', 'stop_sequence']);

console.log('Database generation complete!');
db.close();
