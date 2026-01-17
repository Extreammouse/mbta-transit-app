import { MBTA_COLORS } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={styles.header}>
        <View style={styles.appIcon}>
          <Ionicons name="train" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>MBTA Transit Companion</Text>
        <Text style={styles.subtitle}>Your smart transit guide for Boston</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="map" size={24} color={MBTA_COLORS.navy} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Interactive Map</Text>
            <Text style={styles.featureDescription}>
              Display MBTA routes and stops, allow origin/destination selection
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="swap-horizontal" size={24} color={MBTA_COLORS.navy} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Transfer Guidance</Text>
            <Text style={styles.featureDescription}>
              Estimate walk time between platforms with adjustable walking speed
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="pulse" size={24} color={MBTA_COLORS.navy} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Live Connection Finder</Text>
            <Text style={styles.featureDescription}>
              Show next available connections using real-time predictions
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="speedometer" size={24} color={MBTA_COLORS.navy} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Confidence Indicator</Text>
            <Text style={styles.featureDescription}>
              Display Likely/Risky/Unlikely badges for each transfer
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="flask" size={24} color={MBTA_COLORS.navy} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>What-If Scenarios</Text>
            <Text style={styles.featureDescription}>
              Simulate what-if scenarios (e.g., arriving later or delays)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Source</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            This app uses the official{' '}
            <Text style={styles.link} onPress={() => handleOpenLink('https://www.mbta.com/developers/v3-api')}>
              MBTA V3 API
            </Text>
            {' '}to provide real-time transit information. All data is provided by the Massachusetts
            Bay Transportation Authority.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Started</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            To get higher API rate limits (1,000 requests/min vs 20), request a free API key at:
          </Text>
          <TouchableOpacity
            style={styles.apiButton}
            onPress={() => handleOpenLink('https://api-v3.mbta.com/')}
          >
            <Ionicons name="key" size={20} color="#FFFFFF" />
            <Text style={styles.apiButtonText}>Get Free API Key</Text>
            <Ionicons name="open-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.infoSubtext}>
            Then add it to constants/Config.ts in the API_KEY field.
          </Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={20} color={MBTA_COLORS.textLight} />
        <Text style={styles.disclaimerText}>
          This is an unofficial app. Data accuracy is not guaranteed. Always verify important
          travel information on mbta.com.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with React Native + Expo</Text>
        <Text style={styles.footerText}>Using MBTA V3 API</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: MBTA_COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MBTA_COLORS.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MBTA_COLORS.navy,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: MBTA_COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: MBTA_COLORS.textLight,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: MBTA_COLORS.text,
    lineHeight: 20,
  },
  link: {
    color: MBTA_COLORS.blue,
    fontWeight: '600',
  },
  apiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: MBTA_COLORS.navy,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  apiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 12,
    color: MBTA_COLORS.textLight,
    fontStyle: 'italic',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: MBTA_COLORS.textLight,
    marginBottom: 4,
  },
});
