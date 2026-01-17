import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MBTA_COLORS } from '@/constants/Colors';
import { WalkingSpeed } from '@/src/types/mbta';
import { getSpeedDescription } from '@/src/services/transfer-calc';
import { APP_NAME, APP_VERSION } from '@/constants/Config';

export default function SettingsScreen() {
  const [walkingSpeed, setWalkingSpeed] = useState<WalkingSpeed>('normal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const speedOptions: { value: WalkingSpeed; label: string; description: string }[] = [
    { value: 'slow', label: 'Slow', description: getSpeedDescription('slow') },
    { value: 'normal', label: 'Normal', description: getSpeedDescription('normal') },
    { value: 'fast', label: 'Fast', description: getSpeedDescription('fast') },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Walking Speed */}
        <View style={styles.settingGroup}>
          <View style={styles.settingHeader}>
            <Ionicons name="walk" size={20} color={MBTA_COLORS.navy} />
            <Text style={styles.settingTitle}>Walking Speed</Text>
          </View>
          <Text style={styles.settingDescription}>
            Adjust how fast you typically walk to get more accurate transfer times
          </Text>
          <View style={styles.speedOptions}>
            {speedOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.speedOption,
                  walkingSpeed === option.value && styles.speedOptionActive,
                ]}
                onPress={() => setWalkingSpeed(option.value)}
              >
                <View style={styles.speedOptionContent}>
                  <Text
                    style={[
                      styles.speedOptionLabel,
                      walkingSpeed === option.value && styles.speedOptionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.speedOptionDescription,
                      walkingSpeed === option.value && styles.speedOptionDescriptionActive,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {walkingSpeed === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="notifications" size={20} color={MBTA_COLORS.navy} />
              <Text style={styles.settingTitle}>Push Notifications</Text>
            </View>
            <Text style={styles.settingDescription}>Get alerts for delays and changes</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#D1D5DB', true: MBTA_COLORS.navy }}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* Service Alerts */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="warning" size={20} color={MBTA_COLORS.navy} />
              <Text style={styles.settingTitle}>Service Alerts</Text>
            </View>
            <Text style={styles.settingDescription}>Show active service disruptions</Text>
          </View>
          <Switch
            value={showAlerts}
            onValueChange={setShowAlerts}
            trackColor={{ false: '#D1D5DB', true: MBTA_COLORS.navy }}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* Dark Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="moon" size={20} color={MBTA_COLORS.navy} />
              <Text style={styles.settingTitle}>Dark Mode</Text>
            </View>
            <Text style={styles.settingDescription}>Use dark theme</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#D1D5DB', true: MBTA_COLORS.navy }}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </View>

      {/* Resources Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink('https://www.mbta.com/')}
        >
          <View style={styles.linkInfo}>
            <Ionicons name="globe" size={20} color={MBTA_COLORS.navy} />
            <Text style={styles.linkText}>MBTA Website</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={MBTA_COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink('https://www.mbta.com/schedules')}
        >
          <View style={styles.linkInfo}>
            <Ionicons name="calendar" size={20} color={MBTA_COLORS.navy} />
            <Text style={styles.linkText}>View Schedules</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={MBTA_COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink('https://www.mbta.com/fares')}
        >
          <View style={styles.linkInfo}>
            <Ionicons name="card" size={20} color={MBTA_COLORS.navy} />
            <Text style={styles.linkText}>Fare Information</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={MBTA_COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink('https://api-v3.mbta.com/')}
        >
          <View style={styles.linkInfo}>
            <Ionicons name="key" size={20} color={MBTA_COLORS.navy} />
            <Text style={styles.linkText}>Get API Key</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={MBTA_COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.aboutCard}>
          <View style={styles.appIcon}>
            <Ionicons name="train" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.appVersion}>Version {APP_VERSION}</Text>
          <Text style={styles.aboutDescription}>
            An unofficial MBTA transit companion app featuring interactive maps, real-time
            predictions, transfer guidance, and what-if scenario planning.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={MBTA_COLORS.green} />
              <Text style={styles.featureText}>Live connection finder</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={MBTA_COLORS.green} />
              <Text style={styles.featureText}>Transfer confidence indicators</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={MBTA_COLORS.green} />
              <Text style={styles.featureText}>Walking time estimates</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={MBTA_COLORS.green} />
              <Text style={styles.featureText}>What-if scenario simulator</Text>
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This app uses the official MBTA V3 API. Data is provided as-is and may not always be
          accurate. Please verify important travel information on mbta.com.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with ❤️ for Boston transit riders
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MBTA_COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 16,
  },
  settingGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MBTA_COLORS.text,
  },
  settingDescription: {
    fontSize: 13,
    color: MBTA_COLORS.textLight,
    lineHeight: 18,
  },
  speedOptions: {
    marginTop: 16,
    gap: 10,
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speedOptionActive: {
    backgroundColor: MBTA_COLORS.navy,
    borderColor: MBTA_COLORS.navy,
  },
  speedOptionContent: {
    flex: 1,
  },
  speedOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: MBTA_COLORS.text,
  },
  speedOptionLabelActive: {
    color: '#FFFFFF',
  },
  speedOptionDescription: {
    fontSize: 12,
    color: MBTA_COLORS.textLight,
    marginTop: 2,
  },
  speedOptionDescriptionActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 10,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: MBTA_COLORS.text,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: MBTA_COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: MBTA_COLORS.textLight,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: MBTA_COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  features: {
    alignSelf: 'stretch',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: MBTA_COLORS.text,
  },
  disclaimer: {
    fontSize: 12,
    color: MBTA_COLORS.textLight,
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: MBTA_COLORS.textLight,
  },
});
