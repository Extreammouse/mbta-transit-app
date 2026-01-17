import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mbtaApi } from '../services/mbta-api';
import { API_CONFIG } from '../../constants/Config';
import { Route, Stop, Prediction, Alert, Vehicle, Schedule } from '../types/mbta';

/**
 * Hook to fetch all subway routes (Light Rail + Heavy Rail)
 */
export function useSubwayRoutes() {
    return useQuery<Route[], Error>({
        queryKey: ['routes', 'subway'],
        queryFn: () => mbtaApi.getSubwayRoutes(),
        staleTime: 5 * 60 * 1000, // 5 minutes - routes don't change often
    });
}

/**
 * Hook to fetch all routes
 */
export function useRoutes(type?: number | number[]) {
    return useQuery<Route[], Error>({
        queryKey: ['routes', type],
        queryFn: () => mbtaApi.getRoutes(type),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch a specific route
 */
export function useRoute(routeId: string) {
    return useQuery<Route, Error>({
        queryKey: ['route', routeId],
        queryFn: () => mbtaApi.getRoute(routeId),
        enabled: !!routeId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch stops for a route
 */
export function useStops(routeId?: string) {
    return useQuery<Stop[], Error>({
        queryKey: ['stops', routeId],
        queryFn: () => mbtaApi.getStops(routeId),
        enabled: routeId !== undefined,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch stops for multiple routes
 */
export function useStopsForRoutes(routeIds: string[]) {
    return useQuery<Stop[], Error>({
        queryKey: ['stops', 'routes', routeIds],
        queryFn: () => mbtaApi.getStopsForRoutes(routeIds),
        enabled: routeIds.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch a specific stop
 */
export function useStop(stopId: string) {
    return useQuery<Stop, Error>({
        queryKey: ['stop', stopId],
        queryFn: () => mbtaApi.getStop(stopId),
        enabled: !!stopId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to fetch real-time predictions for a stop
 */
export function usePredictions(
    stopId: string,
    routeId?: string,
    directionId?: number
) {
    return useQuery<Prediction[], Error>({
        queryKey: ['predictions', stopId, routeId, directionId],
        queryFn: () => mbtaApi.getPredictions(stopId, routeId, directionId),
        enabled: !!stopId,
        refetchInterval: API_CONFIG.PREDICTIONS_REFRESH,
        staleTime: API_CONFIG.PREDICTIONS_REFRESH,
    });
}

/**
 * Hook to fetch predictions for multiple stops
 */
export function usePredictionsForStops(stopIds: string[]) {
    return useQuery<Prediction[], Error>({
        queryKey: ['predictions', 'stops', stopIds],
        queryFn: () => mbtaApi.getPredictionsForStops(stopIds),
        enabled: stopIds.length > 0,
        refetchInterval: API_CONFIG.PREDICTIONS_REFRESH,
        staleTime: API_CONFIG.PREDICTIONS_REFRESH,
    });
}

/**
 * Hook to fetch predictions with included stop and route data
 */
export function usePredictionsWithDetails(stopId: string) {
    return useQuery({
        queryKey: ['predictions', 'details', stopId],
        queryFn: () => mbtaApi.getPredictionsWithDetails(stopId),
        enabled: !!stopId,
        refetchInterval: API_CONFIG.PREDICTIONS_REFRESH,
        staleTime: API_CONFIG.PREDICTIONS_REFRESH,
    });
}

/**
 * Hook to fetch schedules for a stop
 */
export function useSchedules(stopId: string, routeId?: string, date?: string) {
    return useQuery<Schedule[], Error>({
        queryKey: ['schedules', stopId, routeId, date],
        queryFn: () => mbtaApi.getSchedules(stopId, routeId, date),
        enabled: !!stopId,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Hook to fetch alerts
 */
export function useAlerts(routeId?: string, stopId?: string) {
    return useQuery<Alert[], Error>({
        queryKey: ['alerts', routeId, stopId],
        queryFn: () => mbtaApi.getAlerts(routeId, stopId),
        refetchInterval: API_CONFIG.ALERTS_REFRESH,
        staleTime: API_CONFIG.ALERTS_REFRESH,
    });
}

/**
 * Hook to fetch vehicle positions
 */
export function useVehicles(routeId?: string) {
    return useQuery<Vehicle[], Error>({
        queryKey: ['vehicles', routeId],
        queryFn: () => mbtaApi.getVehicles(routeId),
        refetchInterval: API_CONFIG.VEHICLES_REFRESH,
        staleTime: API_CONFIG.VEHICLES_REFRESH,
    });
}

/**
 * Hook to fetch route shapes (polylines)
 */
export function useShapes(routeId: string) {
    return useQuery({
        queryKey: ['shapes', routeId],
        queryFn: () => mbtaApi.getShapes(routeId),
        enabled: !!routeId,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours - shapes rarely change
    });
}

/**
 * Hook to prefetch data for better UX
 */
export function usePrefetchRouteData() {
    const queryClient = useQueryClient();

    const prefetchStops = async (routeId: string) => {
        await queryClient.prefetchQuery({
            queryKey: ['stops', routeId],
            queryFn: () => mbtaApi.getStops(routeId),
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchPredictions = async (stopId: string) => {
        await queryClient.prefetchQuery({
            queryKey: ['predictions', stopId, undefined, undefined],
            queryFn: () => mbtaApi.getPredictions(stopId),
            staleTime: API_CONFIG.PREDICTIONS_REFRESH,
        });
    };

    return { prefetchStops, prefetchPredictions };
}
