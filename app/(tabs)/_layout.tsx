import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { MBTA_COLORS } from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -2 }} {...props} />;
}

import { Image } from 'react-native';

function HeaderLogo() {
  return (
    <View style={styles.headerLogo}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/MBTA.svg.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.logoText}>MBTA Transit</Text>
    </View>
  );
}

import ChatOverlay from '@/components/ChatOverlay';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: MBTA_COLORS.navy,
          tabBarInactiveTintColor: MBTA_COLORS.textLight,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            paddingTop: 8,
            paddingBottom: 8,
            height: 65,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: MBTA_COLORS.navy,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            headerTitle: () => <HeaderLogo />,
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons
                      name="information-circle-outline"
                      size={26}
                      color="#FFFFFF"
                      style={{ marginRight: 16, opacity: pressed ? 0.6 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Plan Trip',
            tabBarIcon: ({ color }) => <TabBarIcon name="swap-horizontal" color={color} />,
            headerTitle: 'Trip Planner',
          }}
        />
        <Tabs.Screen
          name="connections"
          options={{
            title: 'Live',
            tabBarIcon: ({ color }) => <TabBarIcon name="pulse" color={color} />,
            headerTitle: 'Live Connections',
          }}
        />
        <Tabs.Screen
          name="navigate"
          options={{
            title: 'Navigate',
            tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
            headerTitle: 'Indoor Navigation',
            headerShown: false, // AR view manages its own header
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
            headerTitle: 'Settings',
          }}
        />
      </Tabs>
      <ChatOverlay />
    </>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 26,
    height: 26,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
