// MBTA API Response Types

export interface ApiResponse<T> {
    data: T;
    included?: any[];
    links?: {
        first?: string;
        last?: string;
        next?: string;
        prev?: string;
    };
}

// Route Types
export interface Route {
    id: string;
    type: 'route';
    attributes: {
        color: string;
        description: string;
        direction_destinations: string[];
        direction_names: string[];
        fare_class: string;
        long_name: string;
        short_name: string;
        sort_order: number;
        text_color: string;
        type: number; // 0=Light Rail, 1=Heavy Rail, 2=Commuter Rail, 3=Bus, 4=Ferry
    };
    relationships?: {
        line?: {
            data: { id: string; type: string };
        };
    };
}

// Stop Types
export interface Stop {
    id: string;
    type: 'stop';
    attributes: {
        address: string | null;
        at_street: string | null;
        description: string | null;
        latitude: number;
        longitude: number;
        location_type: number;
        municipality: string;
        name: string;
        on_street: string | null;
        platform_code: string | null;
        platform_name: string | null;
        vehicle_type: number | null;
        wheelchair_boarding: number;
    };
    relationships?: {
        parent_station?: {
            data: { id: string; type: string } | null;
        };
        route?: {
            data: { id: string; type: string };
        };
    };
}

// Prediction Types
export interface Prediction {
    id: string;
    type: 'prediction';
    attributes: {
        arrival_time: string | null;
        arrival_uncertainty: number | null;
        departure_time: string | null;
        departure_uncertainty: number | null;
        direction_id: number;
        schedule_relationship: string | null;
        status: string | null;
        stop_sequence: number;
    };
    relationships?: {
        route?: {
            data: { id: string; type: string };
        };
        stop?: {
            data: { id: string; type: string };
        };
        trip?: {
            data: { id: string; type: string };
        };
        vehicle?: {
            data: { id: string; type: string } | null;
        };
    };
}

// Schedule Types
export interface Schedule {
    id: string;
    type: 'schedule';
    attributes: {
        arrival_time: string | null;
        departure_time: string | null;
        direction_id: number;
        drop_off_type: number;
        pickup_type: number;
        stop_headsign: string | null;
        stop_sequence: number;
        timepoint: boolean;
    };
    relationships?: {
        route?: {
            data: { id: string; type: string };
        };
        stop?: {
            data: { id: string; type: string };
        };
        trip?: {
            data: { id: string; type: string };
        };
    };
}

// Vehicle Types
export interface Vehicle {
    id: string;
    type: 'vehicle';
    attributes: {
        bearing: number;
        carriages: any[];
        current_status: 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO';
        current_stop_sequence: number;
        direction_id: number;
        label: string;
        latitude: number;
        longitude: number;
        occupancy_status: string | null;
        speed: number | null;
        updated_at: string;
    };
    relationships?: {
        route?: {
            data: { id: string; type: string };
        };
        stop?: {
            data: { id: string; type: string };
        };
        trip?: {
            data: { id: string; type: string };
        };
    };
}

// Alert Types
export interface Alert {
    id: string;
    type: 'alert';
    attributes: {
        active_period: Array<{
            start: string;
            end: string | null;
        }>;
        banner: string | null;
        cause: string;
        created_at: string;
        description: string | null;
        effect: string;
        effect_name: string;
        header: string;
        informed_entity: Array<{
            activities: string[];
            route?: string;
            route_type?: number;
            stop?: string;
            direction_id?: number;
        }>;
        lifecycle: string;
        severity: number;
        short_header: string;
        timeframe: string | null;
        updated_at: string;
        url: string | null;
    };
}

// Shape Types (for route polylines)
export interface Shape {
    id: string;
    type: 'shape';
    attributes: {
        polyline: string; // Encoded polyline
    };
}

// Trip Types
export interface Trip {
    id: string;
    type: 'trip';
    attributes: {
        bikes_allowed: number;
        block_id: string;
        direction_id: number;
        headsign: string;
        name: string;
        wheelchair_accessible: number;
    };
    relationships?: {
        route?: {
            data: { id: string; type: string };
        };
        shape?: {
            data: { id: string; type: string };
        };
    };
}

// App-specific types
export type ConfidenceLevel = 'likely' | 'risky' | 'unlikely';

export interface TransferInfo {
    fromStop: Stop;
    toStop: Stop;
    walkingTimeSeconds: number;
    walkingDistanceMeters: number;
    confidence: ConfidenceLevel;
    bufferSeconds: number;
}

export interface ConnectionOption {
    route: Route;
    prediction: Prediction;
    stop: Stop;
    arrivalTime: Date;
    minutesUntilArrival: number;
}

export interface TripPlan {
    origin: Stop;
    destination: Stop;
    legs: TripLeg[];
    totalDuration: number;
    transfers: TransferInfo[];
}

export interface TripLeg {
    route: Route;
    fromStop: Stop;
    toStop: Stop;
    departureTime: Date;
    arrivalTime: Date;
    duration: number;
    prediction?: Prediction;
}

export type WalkingSpeed = 'slow' | 'normal' | 'fast';
