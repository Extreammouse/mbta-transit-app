import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MBTA_COLORS } from '../../constants/Colors';
import { BOSTON_REGION } from '../../constants/Config';
import { Route, Shape, Stop } from '../../src/types/mbta';
import { decodePolyline, getRouteColor } from '../../src/utils/helpers';

interface MBTAMapProps {
    routes: Route[];
    stops: Stop[];
    shapes?: Map<string, Shape[]>;
    selectedOrigin?: Stop | null;
    selectedDestination?: Stop | null;
    onSelectStop?: (stop: Stop, type: 'origin' | 'destination') => void;
    loading?: boolean;
    showRoutes?: boolean;
    selectionMode?: 'origin' | 'destination' | null;
}

export function MBTAMap({
    routes,
    stops,
    shapes,
    selectedOrigin,
    selectedDestination,
    onSelectStop,
    loading = false,
    showRoutes = true,
    selectionMode = null,
}: MBTAMapProps) {
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region>(BOSTON_REGION);

    // Fit map to show all selected markers
    useEffect(() => {
        if (selectedOrigin && selectedDestination && mapRef.current) {
            mapRef.current.fitToCoordinates(
                [
                    {
                        latitude: selectedOrigin.attributes.latitude,
                        longitude: selectedOrigin.attributes.longitude,
                    },
                    {
                        latitude: selectedDestination.attributes.latitude,
                        longitude: selectedDestination.attributes.longitude,
                    },
                ],
                {
                    edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                    animated: true,
                }
            );
        }
    }, [selectedOrigin, selectedDestination]);

    const handleMarkerPress = (stop: Stop) => {
        if (selectionMode && onSelectStop) {
            onSelectStop(stop, selectionMode);
        }
    };

    const getMarkerColor = (stop: Stop): string => {
        if (selectedOrigin?.id === stop.id) return MBTA_COLORS.green;
        if (selectedDestination?.id === stop.id) return MBTA_COLORS.red;
        return MBTA_COLORS.navy;
    };

    const getMarkerSize = (stop: Stop): number => {
        if (selectedOrigin?.id === stop.id || selectedDestination?.id === stop.id) {
            return 20;
        }
        return 12;
    };

    // Get decoded polylines for each route
    const getRoutePolylines = () => {
        if (!shapes) return [];

        const polylines: Array<{
            routeId: string;
            color: string;
            coordinates: Array<{ latitude: number; longitude: number }>;
        }> = [];

        shapes.forEach((routeShapes, routeId) => {
            const route = routes.find((r) => r.id === routeId);
            const color = route
                ? getRouteColor(route.id, route.attributes.color)
                : MBTA_COLORS.navy;

            routeShapes.forEach((shape) => {
                const coordinates = decodePolyline(shape.attributes.polyline);
                polylines.push({
                    routeId: `${routeId}-${shape.id}`,
                    color,
                    coordinates,
                });
            });
        });

        return polylines;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={MBTA_COLORS.navy} />
                <Text style={styles.loadingText}>Loading map data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {selectionMode && (
                <View style={styles.selectionBanner}>
                    <Ionicons
                        name={selectionMode === 'origin' ? 'location' : 'flag'}
                        size={20}
                        color="#FFFFFF"
                    />
                    <Text style={styles.selectionText}>
                        Tap a station to set as {selectionMode === 'origin' ? 'origin' : 'destination'}
                    </Text>
                </View>
            )}

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={BOSTON_REGION}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation
                showsMyLocationButton
                showsCompass
                rotateEnabled={false}
            >
                {/* Route polylines */}
                {showRoutes &&
                    getRoutePolylines().map((polyline) => (
                        <Polyline
                            key={polyline.routeId}
                            coordinates={polyline.coordinates}
                            strokeColor={polyline.color}
                            strokeWidth={4}
                            lineCap="round"
                            lineJoin="round"
                        />
                    ))}

                {/* Stop markers */}
                {stops.map((stop) => (
                    <Marker
                        key={stop.id}
                        coordinate={{
                            latitude: stop.attributes.latitude,
                            longitude: stop.attributes.longitude,
                        }}
                        title={stop.attributes.name}
                        description={stop.attributes.municipality || undefined}
                        onPress={() => handleMarkerPress(stop)}
                        tracksViewChanges={false}
                    >
                        <View
                            style={[
                                styles.marker,
                                {
                                    backgroundColor: getMarkerColor(stop),
                                    width: getMarkerSize(stop),
                                    height: getMarkerSize(stop),
                                    borderRadius: getMarkerSize(stop) / 2,
                                },
                            ]}
                        >
                            {(selectedOrigin?.id === stop.id || selectedDestination?.id === stop.id) && (
                                <Ionicons
                                    name={selectedOrigin?.id === stop.id ? 'location' : 'flag'}
                                    size={12}
                                    color="#FFFFFF"
                                />
                            )}
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Legend */}
            <View style={styles.legend}>
                {selectedOrigin && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: MBTA_COLORS.green }]} />
                        <Text style={styles.legendText} numberOfLines={1}>
                            {selectedOrigin.attributes.name}
                        </Text>
                    </View>
                )}
                {selectedDestination && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: MBTA_COLORS.red }]} />
                        <Text style={styles.legendText} numberOfLines={1}>
                            {selectedDestination.attributes.name}
                        </Text>
                    </View>
                )}
            </View>

            {/* Zoom controls */}
            <View style={styles.zoomControls}>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => {
                        setRegion((prev) => ({
                            ...prev,
                            latitudeDelta: prev.latitudeDelta * 0.5,
                            longitudeDelta: prev.longitudeDelta * 0.5,
                        }));
                    }}
                >
                    <Ionicons name="add" size={24} color={MBTA_COLORS.navy} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => {
                        setRegion((prev) => ({
                            ...prev,
                            latitudeDelta: prev.latitudeDelta * 2,
                            longitudeDelta: prev.longitudeDelta * 2,
                        }));
                    }}
                >
                    <Ionicons name="remove" size={24} color={MBTA_COLORS.navy} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: MBTA_COLORS.textLight,
    },
    selectionBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: MBTA_COLORS.navy,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    selectionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    marker: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    legend: {
        position: 'absolute',
        bottom: 100,
        left: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        maxWidth: 200,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 13,
        color: MBTA_COLORS.text,
        flex: 1,
    },
    zoomControls: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        gap: 8,
    },
    zoomButton: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default MBTAMap;
