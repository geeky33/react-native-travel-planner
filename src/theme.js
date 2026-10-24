import { Platform } from 'react-native';

// Same colour palette as the Flutter version.
export const colors = {
  background: '#F6F8FC',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  sky: '#0EA5E9',
  cyan: '#06B6D4',
  purple: '#8B5CF6',
  green: '#10B981',
  greenDark: '#059669',
  red: '#EF4444',
  orange: '#F97316',
  ink: '#0F172A',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  blue50: '#EFF4FF',
  blue100: '#E0EAFF',
  violet50: '#F3EEFF',
  green50: '#E9FBF4',
  green50b: '#E8FFF5',
  orange50: '#FFF7ED',
  orange200: '#FED7AA',
  orange900: '#7C2D12',
  white: '#FFFFFF',
};

// Soft card shadow (works on iOS via shadow*, Android via elevation).
export const cardShadow = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
});
