import { Tabs } from 'expo-router';
import { Chrome as Home, Bookmark, Settings, Shield } from 'lucide-react-native';
import { Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.primary,
          borderTopWidth: 2,
          height: isTablet ? 80 : 70,
          paddingBottom: isTablet ? 16 : 12,
          paddingTop: isTablet ? 12 : 8,
          paddingHorizontal: isTablet ? 20 : 0,
          elevation: 12,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          position: 'absolute',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          fontSize: isTablet ? 13 : 11,
          fontWeight: '700',
          fontFamily: 'NotoSansBengali-Bold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ size, color }) => (
            <Home size={isTablet ? size + 2 : size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('saved'),
          tabBarIcon: ({ size, color }) => (
            <Bookmark size={isTablet ? size + 2 : size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: t('security'),
          tabBarIcon: ({ size, color }) => (
            <Shield size={isTablet ? size + 2 : size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ size, color }) => (
            <Settings size={isTablet ? size + 2 : size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}