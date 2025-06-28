import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Moon, 
  Sun,
  Monitor,
  Download, 
  Trash2, 
  Info, 
  ExternalLink,
  RefreshCw,
  Mail,
  Shield,
  Globe,
  Languages,
  ChevronRight
} from 'lucide-react-native';
import { StorageService } from '@/services/StorageService';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const { theme, setTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const clearCache = async () => {
    Alert.alert(
      t('clearCache'),
      'আপনি কি নিশ্চিত যে আপনি সমস্ত ক্যাশ ডেটা পরিষ্কার করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        { 
          text: 'পরিষ্কার করুন', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearCache();
              Alert.alert(t('success'), 'ক্যাশ সফলভাবে পরিষ্কার করা হয়েছে');
            } catch (error) {
              Alert.alert(t('error'), 'ক্যাশ পরিষ্কার করতে সমস্যা হয়েছে');
            }
          }
        }
      ]
    );
  };

  const clearSavedArticles = async () => {
    Alert.alert(
      t('clearSaved'),
      'আপনি কি নিশ্চিত যে আপনি সমস্ত সংরক্ষিত খবর মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        { 
          text: 'মুছে ফেলুন', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearSavedArticles();
              Alert.alert(t('success'), 'সংরক্ষিত খবর সফলভাবে মুছে ফেলা হয়েছে');
            } catch (error) {
              Alert.alert(t('error'), 'সংরক্ষিত খবর মুছতে সমস্যা হয়েছে');
            }
          }
        }
      ]
    );
  };

  const showAbout = () => {
    router.push('/about');
  };

  const showPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const contactSupport = () => {
    const email = 'support@bugmohol.com';
    const subject = 'Bug Mohol App Support';
    const body = 'আপনার সমস্যা বা পরামর্শ এখানে লিখুন...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        t('contactSupport'),
        `ইমেইল: ${email}\n\nঅথবা আমাদের ওয়েবসাইট ভিজিট করুন: www.bugmohol.com`,
        [{ text: 'ঠিক আছে' }]
      );
    });
  };

  const openWebsite = () => {
    Linking.openURL('https://www.bugmohol.com');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return t('lightMode');
      case 'dark':
        return t('darkMode');
      default:
        return t('systemMode');
    }
  };

  const showThemeSelector = () => {
    Alert.alert(
      'থিম নির্বাচন করুন',
      'আপনার পছন্দের থিম বেছে নিন',
      [
        { text: t('lightMode'), onPress: () => setTheme('light') },
        { text: t('darkMode'), onPress: () => setTheme('dark') },
        { text: t('systemMode'), onPress: () => setTheme('system') },
        { text: 'বাতিল', style: 'cancel' }
      ]
    );
  };

  const showLanguageSelector = () => {
    Alert.alert(
      t('language'),
      'ভাষা নির্বাচন করুন / Select Language',
      [
        { text: t('bengali'), onPress: () => setLanguage('bn') },
        { text: t('english'), onPress: () => setLanguage('en') },
        { text: 'বাতিল / Cancel', style: 'cancel' }
      ]
    );
  };

  const SettingItem: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    destructive?: boolean;
    showChevron?: boolean;
    rightText?: string;
  }> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch, 
    switchValue, 
    onSwitchChange,
    destructive = false,
    showChevron = false,
    rightText
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }, isTablet && styles.settingItemTablet]}
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: colors.background },
          destructive && { backgroundColor: '#2A0A0A' }, 
          isTablet && styles.iconContainerTablet
        ]}>
          <Icon size={isTablet ? 24 : 20} color={destructive ? colors.error : colors.text} strokeWidth={2} />
        </View>
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle, 
            { color: colors.text },
            destructive && { color: colors.error }, 
            isTablet && styles.settingTitleTablet
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }, isTablet && styles.settingSubtitleTablet]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={switchValue ? '#FFFFFF' : colors.textSecondary}
          style={isTablet ? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : {}}
        />
      ) : rightText ? (
        <View style={styles.rightContent}>
          <Text style={[styles.rightText, { color: colors.textSecondary }]}>{rightText}</Text>
          {showChevron && <ChevronRight size={isTablet ? 18 : 16} color={colors.textSecondary} strokeWidth={2} />}
        </View>
      ) : showChevron ? (
        <ChevronRight size={isTablet ? 18 : 16} color={colors.textSecondary} strokeWidth={2} />
      ) : (
        <ExternalLink size={isTablet ? 18 : 16} color={colors.textSecondary} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );

  const renderSettingsGrid = () => {
    const sections = [
      {
        title: 'অ্যাপ সেটিংস',
        items: [
          {
            icon: getThemeIcon(),
            title: 'থিম',
            subtitle: 'অ্যাপের চেহারা পরিবর্তন করুন',
            onPress: showThemeSelector,
            showChevron: true,
            rightText: getThemeText(),
          },
          {
            icon: Languages,
            title: t('language'),
            subtitle: 'ভাষা পরিবর্তন করুন / Change Language',
            onPress: showLanguageSelector,
            showChevron: true,
            rightText: language === 'bn' ? t('bengali') : t('english'),
          },
          {
            icon: Bell,
            title: t('notifications'),
            subtitle: 'নতুন খবরের জন্য বিজ্ঞপ্তি পান',
            showSwitch: true,
            switchValue: notificationsEnabled,
            onSwitchChange: setNotificationsEnabled,
          },
        ],
      },
      {
        title: 'অফলাইন পড়া',
        items: [
          {
            icon: Download,
            title: t('autoDownload'),
            subtitle: 'WiFi এ স্বয়ংক্রিয়ভাবে খবর ডাউনলোড করুন',
            showSwitch: true,
            switchValue: autoDownload,
            onSwitchChange: setAutoDownload,
          },
        ],
      },
      {
        title: 'ডেটা পরিচালনা',
        items: [
          {
            icon: RefreshCw,
            title: t('clearCache'),
            subtitle: 'অস্থায়ী ফাইল এবং ক্যাশ ডেটা মুছুন',
            onPress: clearCache,
            showChevron: true,
          },
          {
            icon: Trash2,
            title: t('clearSaved'),
            subtitle: 'সমস্ত সংরক্ষিত খবর মুছে ফেলুন',
            onPress: clearSavedArticles,
            destructive: true,
            showChevron: true,
          },
        ],
      },
      {
        title: 'সাহায্য ও সাপোর্ট',
        items: [
          {
            icon: Globe,
            title: 'Bug Mohol ওয়েবসাইট',
            subtitle: 'আমাদের অফিসিয়াল ওয়েবসাইট ভিজিট করুন',
            onPress: openWebsite,
            showChevron: true,
          },
          {
            icon: Mail,
            title: t('contactSupport'),
            subtitle: 'সমস্যা বা পরামর্শের জন্য যোগাযোগ করুন',
            onPress: contactSupport,
            showChevron: true,
          },
          {
            icon: Shield,
            title: t('privacyPolicy'),
            subtitle: 'আমাদের গোপনীয়তা নীতি পড়ুন',
            onPress: showPrivacyPolicy,
            showChevron: true,
          },
          {
            icon: Info,
            title: t('about'),
            subtitle: 'সংস্করণ ও অন্যান্য তথ্য',
            onPress: showAbout,
            showChevron: true,
          },
        ],
      },
    ];

    if (isLargeScreen) {
      const rows = [];
      for (let i = 0; i < sections.length; i += 2) {
        rows.push(
          <View key={i} style={styles.sectionsRow}>
            <View style={styles.sectionColumn}>
              <Text style={[styles.sectionTitle, { color: colors.primary }, styles.sectionTitleTablet]}>{sections[i].title}</Text>
              {sections[i].items.map((item, index) => (
                <SettingItem key={index} {...item} />
              ))}
            </View>
            {sections[i + 1] && (
              <View style={styles.sectionColumn}>
                <Text style={[styles.sectionTitle, { color: colors.primary }, styles.sectionTitleTablet]}>{sections[i + 1].title}</Text>
                {sections[i + 1].items.map((item, index) => (
                  <SettingItem key={index} {...item} />
                ))}
              </View>
            )}
          </View>
        );
      }
      return rows;
    }

    return sections.map((section, sectionIndex) => (
      <View key={sectionIndex} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }, isTablet && styles.sectionTitleTablet]}>{section.title}</Text>
        {section.items.map((item, index) => (
          <SettingItem key={index} {...item} />
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderSettingsGrid()}

        <View style={[styles.footer, { borderTopColor: colors.border }, isTablet && styles.footerTablet]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }, isTablet && styles.footerTextTablet]}>
            Bug Mohol - সাইবার দুনিয়ার অন্ধকার খবর
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }, isTablet && styles.versionTextTablet]}>সংস্করণ 1.0.0</Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }, isTablet && styles.copyrightTextTablet]}>
            © 2024 Bug Mohol. সকল অধিকার সংরক্ষিত।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: isTablet ? 32 : 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'NotoSansBengali-Bold',
  },
  content: {
    padding: isTablet ? 32 : 16,
    paddingBottom: 100,
  },
  sectionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  sectionColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 5,
    fontFamily: 'NotoSansBengali-Bold',
  },
  sectionTitleTablet: {
    fontSize: 18,
    marginBottom: 16,
  },
  settingItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    elevation: 2,
  },
  settingItemTablet: {
    padding: 20,
    borderRadius: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerTablet: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'NotoSansBengali-Bold',
  },
  settingTitleTablet: {
    fontSize: 18,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali-Regular',
  },
  settingSubtitleTablet: {
    fontSize: 14,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'NotoSansBengali-Regular',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerTablet: {
    marginTop: 40,
    paddingTop: 30,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'NotoSansBengali-Regular',
  },
  footerTextTablet: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'NotoSansBengali-Regular',
  },
  versionTextTablet: {
    fontSize: 14,
  },
  copyrightText: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'NotoSansBengali-Regular',
  },
  copyrightTextTablet: {
    fontSize: 12,
  },
});