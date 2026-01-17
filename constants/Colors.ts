// MBTA Official Colors
export const MBTA_COLORS = {
  // Primary
  navy: '#1C345F',
  white: '#FFFFFF',

  // Transit Lines
  red: '#DA291C',
  orange: '#ED8B00',
  green: '#00843D',
  blue: '#003DA5',
  silver: '#7C878E',
  purple: '#80276C',  // Commuter Rail
  yellow: '#FCB916',  // Bus

  // UI Colors
  background: '#F5F7FA',
  backgroundDark: '#0D1B2A',
  card: '#FFFFFF',
  cardDark: '#1B2838',
  text: '#1C345F',
  textLight: '#6B7280',
  textDark: '#FFFFFF',
  border: '#E5E7EB',
  borderDark: '#374151',

  // Confidence Badges
  likely: '#22C55E',      // Green - high confidence
  risky: '#F59E0B',       // Amber - medium confidence
  unlikely: '#EF4444',    // Red - low confidence

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Route type to color mapping
export const ROUTE_COLORS: { [key: string]: string } = {
  'Red': MBTA_COLORS.red,
  'Orange': MBTA_COLORS.orange,
  'Green-B': MBTA_COLORS.green,
  'Green-C': MBTA_COLORS.green,
  'Green-D': MBTA_COLORS.green,
  'Green-E': MBTA_COLORS.green,
  'Blue': MBTA_COLORS.blue,
  'Mattapan': MBTA_COLORS.red,
  // Silver Line
  'SL1': MBTA_COLORS.silver,
  'SL2': MBTA_COLORS.silver,
  'SL3': MBTA_COLORS.silver,
  'SLW': MBTA_COLORS.silver,
  // Commuter Rail (default purple)
  'CR': MBTA_COLORS.purple,
};

// Light and Dark theme configurations
const tintColorLight = MBTA_COLORS.navy;
const tintColorDark = MBTA_COLORS.white;

export default {
  light: {
    text: MBTA_COLORS.text,
    textSecondary: MBTA_COLORS.textLight,
    background: MBTA_COLORS.background,
    card: MBTA_COLORS.card,
    tint: tintColorLight,
    tabIconDefault: MBTA_COLORS.textLight,
    tabIconSelected: MBTA_COLORS.navy,
    border: MBTA_COLORS.border,
    primary: MBTA_COLORS.navy,
  },
  dark: {
    text: MBTA_COLORS.textDark,
    textSecondary: '#9CA3AF',
    background: MBTA_COLORS.backgroundDark,
    card: MBTA_COLORS.cardDark,
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: MBTA_COLORS.borderDark,
    primary: MBTA_COLORS.blue,
  },
};
