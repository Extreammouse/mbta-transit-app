import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MBTAMap } from '@/components/Map/MBTAMap';
import { StopSelector } from '@/components/StopSelector/StopSelector';
import { MBTA_COLORS } from '@/constants/Colors';
import { mbtaApi } from '@/src/services/mbta-api';
import { Route, Stop } from '@/src/types/mbta';

const queryClient = new QueryClient();

function MapScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Stop | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'origin' | 'destination' | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subway routes (Light Rail + Heavy Rail)
      const subwayRoutes = await mbtaApi.getSubwayRoutes();
      setRoutes(subwayRoutes);

      // Fetch stops for all subway routes
      const routeIds = subwayRoutes.map((r) => r.id);
      const allStops = await mbtaApi.getStopsForRoutes(routeIds);

      // Filter to only parent stations (location_type = 1) or stops without parents
      const uniqueStops = allStops.filter(
        (stop) =>
          stop.attributes.location_type === 1 ||
          !stop.relationships?.parent_station?.data
      );
      setStops(uniqueStops);

    } catch (e) {
      console.error('Failed to load data:', e);
      setError('Failed to load transit data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearSelection = () => {
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setSelectionMode(null);
  };

  const handleMapStopSelect = (stop: Stop, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setSelectedOrigin(stop);
    } else {
      setSelectedDestination(stop);
    }
    setSelectionMode(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={MBTA_COLORS.navy} />
          <Text style={styles.loadingText}>Loading MBTA Data...</Text>
          <Text style={styles.loadingSubtext}>
            Fetching routes and stops
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color={MBTA_COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Interactive Map */}
      <View style={styles.mapContainer}>
        <MBTAMap
          routes={routes}
          stops={stops}
          selectedOrigin={selectedOrigin}
          selectedDestination={selectedDestination}
          onSelectStop={handleMapStopSelect}
          selectionMode={selectionMode}
          showRoutes={true}
        />
      </View>

      {/* Bottom Sheet for Selection */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Select Stations</Text>

          <StopSelector
            stops={stops}
            routes={routes}
            selectedStop={selectedOrigin}
            onSelectStop={setSelectedOrigin}
            label="Origin Station"
            placeholder="Where are you starting from?"
          />

          <View style={styles.swapButtonContainer}>
            <TouchableOpacity
              style={styles.swapButtonCircle}
              onPress={() => {
                const temp = selectedOrigin;
                setSelectedOrigin(selectedDestination);
                setSelectedDestination(temp);
              }}
              disabled={!selectedOrigin && !selectedDestination}
            >
              <Ionicons
                name="swap-vertical"
                size={24}
                color={selectedOrigin || selectedDestination ? MBTA_COLORS.navy : MBTA_COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <StopSelector
            stops={stops}
            routes={routes}
            selectedStop={selectedDestination}
            onSelectStop={setSelectedDestination}
            label="Destination Station"
            placeholder="Where are you going?"
          />

          {(selectedOrigin || selectedDestination) && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              {selectedOrigin && selectedDestination && (
                <TouchableOpacity
                  style={styles.findRouteButton}
                  onPress={() => {
                    Alert.alert(
                      'Route Selected',
                      `From: ${selectedOrigin.attributes.name}\nTo: ${selectedDestination.attributes.name}\n\nSwitch to the "Plan Trip" tab for detailed transfer guidance!`,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Text style={styles.findRouteButtonText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default function MapScreenWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <MapScreen />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MBTA_COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MBTA_COLORS.background,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: MBTA_COLORS.navy,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: MBTA_COLORS.textLight,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MBTA_COLORS.background,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: MBTA_COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: MBTA_COLORS.navy,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E7F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: MBTA_COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: MBTA_COLORS.text,
    lineHeight: 18,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: MBTA_COLORS.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: MBTA_COLORS.textLight,
  },
  bottomSheet: {
    maxHeight: '50%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 16,
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  swapButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
  },
  clearButtonText: {
    color: MBTA_COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  findRouteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MBTA_COLORS.navy,
    paddingVertical: 14,
    borderRadius: 12,
  },
  findRouteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
