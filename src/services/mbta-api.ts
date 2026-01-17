import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../../constants/Config';
import {
    ApiResponse,
    Route,
    Stop,
    Prediction,
    Schedule,
    Vehicle,
    Alert,
    Shape,
    Trip,
} from '../types/mbta';

class MBTAApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            headers: {
                'Accept': 'application/vnd.api+json',
                ...(API_CONFIG.API_KEY && { 'x-api-key': API_CONFIG.API_KEY }),
            },
        });
    }

    // ============ ROUTES ============

    /**
     * Get all MBTA routes
     * @param type - Optional route type filter (0=Light Rail, 1=Heavy Rail, 2=Commuter Rail, 3=Bus, 4=Ferry)
     */
    async getRoutes(type?: number | number[]): Promise<Route[]> {
        const params: any = {};
        if (type !== undefined) {
            params['filter[type]'] = Array.isArray(type) ? type.join(',') : type;
        }
        const response = await this.client.get<ApiResponse<Route[]>>('/routes', { params });
        return response.data.data;
    }

    /**
     * Get subway routes (Light Rail + Heavy Rail)
     */
    async getSubwayRoutes(): Promise<Route[]> {
        return this.getRoutes([0, 1]);
    }

    /**
     * Get a specific route by ID
     */
    async getRoute(routeId: string): Promise<Route> {
        const response = await this.client.get<ApiResponse<Route>>(`/routes/${routeId}`);
        return response.data.data;
    }

    // ============ STOPS ============

    /**
     * Get all stops, optionally filtered by route
     * @param routeId - Optional route ID to filter stops
     */
    async getStops(routeId?: string): Promise<Stop[]> {
        const params: any = {};
        if (routeId) {
            params['filter[route]'] = routeId;
        }
        const response = await this.client.get<ApiResponse<Stop[]>>('/stops', { params });
        return response.data.data;
    }

    /**
     * Get stops for multiple routes
     */
    async getStopsForRoutes(routeIds: string[]): Promise<Stop[]> {
        const params = {
            'filter[route]': routeIds.join(','),
        };
        const response = await this.client.get<ApiResponse<Stop[]>>('/stops', { params });
        return response.data.data;
    }

    /**
     * Get a specific stop by ID
     */
    async getStop(stopId: string): Promise<Stop> {
        const response = await this.client.get<ApiResponse<Stop>>(`/stops/${stopId}`);
        return response.data.data;
    }

    /**
     * Get stops near a location
     */
    async getStopsNearLocation(
        latitude: number,
        longitude: number,
        radius: number = 0.01 // ~1km
    ): Promise<Stop[]> {
        const params = {
            'filter[latitude]': latitude,
            'filter[longitude]': longitude,
            'filter[radius]': radius,
        };
        const response = await this.client.get<ApiResponse<Stop[]>>('/stops', { params });
        return response.data.data;
    }

    // ============ PREDICTIONS ============

    /**
     * Get real-time predictions for a stop
     * @param stopId - Stop ID to get predictions for
     * @param routeId - Optional route ID filter
     * @param directionId - Optional direction filter (0 or 1)
     */
    async getPredictions(
        stopId: string,
        routeId?: string,
        directionId?: number
    ): Promise<Prediction[]> {
        const params: any = {
            'filter[stop]': stopId,
            'sort': 'arrival_time',
        };
        if (routeId) {
            params['filter[route]'] = routeId;
        }
        if (directionId !== undefined) {
            params['filter[direction_id]'] = directionId;
        }
        const response = await this.client.get<ApiResponse<Prediction[]>>('/predictions', { params });
        return response.data.data;
    }

    /**
     * Get predictions for multiple stops
     */
    async getPredictionsForStops(stopIds: string[]): Promise<Prediction[]> {
        const params = {
            'filter[stop]': stopIds.join(','),
            'sort': 'arrival_time',
        };
        const response = await this.client.get<ApiResponse<Prediction[]>>('/predictions', { params });
        return response.data.data;
    }

    /**
     * Get predictions with included stop and route data
     */
    async getPredictionsWithDetails(stopId: string): Promise<{
        predictions: Prediction[];
        stops: Stop[];
        routes: Route[];
    }> {
        const params = {
            'filter[stop]': stopId,
            'include': 'stop,route',
            'sort': 'arrival_time',
        };
        const response = await this.client.get<ApiResponse<Prediction[]>>('/predictions', { params });

        const stops: Stop[] = [];
        const routes: Route[] = [];

        if (response.data.included) {
            response.data.included.forEach((item: any) => {
                if (item.type === 'stop') stops.push(item);
                if (item.type === 'route') routes.push(item);
            });
        }

        return {
            predictions: response.data.data,
            stops,
            routes,
        };
    }

    // ============ SCHEDULES ============

    /**
     * Get schedules for a stop
     */
    async getSchedules(
        stopId: string,
        routeId?: string,
        date?: string // YYYY-MM-DD format
    ): Promise<Schedule[]> {
        const params: any = {
            'filter[stop]': stopId,
            'sort': 'arrival_time',
        };
        if (routeId) {
            params['filter[route]'] = routeId;
        }
        if (date) {
            params['filter[date]'] = date;
        }
        const response = await this.client.get<ApiResponse<Schedule[]>>('/schedules', { params });
        return response.data.data;
    }

    /**
     * Get schedules within a time range
     */
    async getSchedulesInTimeRange(
        stopId: string,
        minTime: string, // HH:MM format
        maxTime: string
    ): Promise<Schedule[]> {
        const params = {
            'filter[stop]': stopId,
            'filter[min_time]': minTime,
            'filter[max_time]': maxTime,
            'sort': 'arrival_time',
        };
        const response = await this.client.get<ApiResponse<Schedule[]>>('/schedules', { params });
        return response.data.data;
    }

    // ============ VEHICLES ============

    /**
     * Get real-time vehicle positions
     */
    async getVehicles(routeId?: string): Promise<Vehicle[]> {
        const params: any = {};
        if (routeId) {
            params['filter[route]'] = routeId;
        }
        const response = await this.client.get<ApiResponse<Vehicle[]>>('/vehicles', { params });
        return response.data.data;
    }

    // ============ ALERTS ============

    /**
     * Get active service alerts
     */
    async getAlerts(routeId?: string, stopId?: string): Promise<Alert[]> {
        const params: any = {
            'filter[activity]': 'BOARD,EXIT,RIDE',
        };
        if (routeId) {
            params['filter[route]'] = routeId;
        }
        if (stopId) {
            params['filter[stop]'] = stopId;
        }
        const response = await this.client.get<ApiResponse<Alert[]>>('/alerts', { params });
        return response.data.data;
    }

    // ============ SHAPES ============

    /**
     * Get route shapes (polylines for map display)
     */
    async getShapes(routeId: string): Promise<Shape[]> {
        const params = {
            'filter[route]': routeId,
        };
        const response = await this.client.get<ApiResponse<Shape[]>>('/shapes', { params });
        return response.data.data;
    }

    // ============ TRIPS ============

    /**
     * Get trips for a route
     */
    async getTrips(routeId: string): Promise<Trip[]> {
        const params = {
            'filter[route]': routeId,
        };
        const response = await this.client.get<ApiResponse<Trip[]>>('/trips', { params });
        return response.data.data;
    }

    /**
     * Get a specific trip by ID
     */
    async getTrip(tripId: string): Promise<Trip> {
        const response = await this.client.get<ApiResponse<Trip>>(`/trips/${tripId}`);
        return response.data.data;
    }
}

// Export singleton instance
export const mbtaApi = new MBTAApiService();
export default mbtaApi;
