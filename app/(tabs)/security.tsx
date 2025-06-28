import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Lock, Eye, TriangleAlert as AlertTriangle, Globe, Smartphone } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

const securityTips = [
  {
    id: '1',
    icon: Lock,
    title: 'শক্তিশালী পাসওয়ার্ড ব্যবহার করুন',
    description: 'কমপক্ষে ১২ ক্যারেক্টারের পাসওয়ার্ড ব্যবহার করুন যাতে বড় হাতের অক্ষর, ছোট হাতের অক্ষর, সংখ্যা এবং বিশেষ চিহ্ন থাকে।',
  },
  {
    id: '2',
    icon: Shield,
    title: 'টু-ফ্যাক্টর অথেন্টিকেশন চালু করুন',
    description: 'আপনার গুরুত্বপূর্ণ একাউন্টগুলোতে 2FA চালু করুন। এটি অতিরিক্ত নিরাপত্তা প্রদান করে।',
  },
  {
    id: '3',
    icon: Eye,
    title: 'ফিশিং থেকে সাবধান থাকুন',
    description: 'সন্দেহজনক ইমেইল বা লিংকে ক্লিক করবেন না। সবসময় URL যাচাই করুন এবং অফিসিয়াল ওয়েবসাইট ব্যবহার করুন।',
  },
  {
    id: '4',
    icon: Smartphone,
    title: 'মোবাইল নিরাপত্তা',
    description: 'আপনার ফোনে স্ক্রিন লক রাখুন, নিয়মিত সফটওয়্যার আপডেট করুন এবং শুধুমাত্র বিশ্বস্ত অ্যাপ স্টোর থেকে অ্যাপ ডাউনলোড করুন।',
  },
  {
    id: '5',
    icon: Globe,
    title: 'পাবলিক ওয়াইফাই এড়িয়ে চলুন',
    description: 'গুরুত্বপূর্ণ কাজের জন্য পাবলিক ওয়াইফাই ব্যবহার করবেন না। প্রয়োজনে VPN ব্যবহার করুন।',
  },
  {
    id: '6',
    icon: AlertTriangle,
    title: 'নিয়মিত ব্যাকআপ নিন',
    description: 'আপনার গুরুত্বপূর্ণ ডেটার নিয়মিত ব্যাকআপ রাখুন বিভিন্ন স্থানে। ক্লাউড এবং ফিজিক্যাল স্টোরেজ উভয় ব্যবহার করুন।',
  },
];

export default function SecurityScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === 'android') {
        router.push('/(tabs)/');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [router]);

  const renderSecurityTip = (tip: typeof securityTips[0]) => (
    <TouchableOpacity 
      key={tip.id} 
      style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }, isTablet && styles.tipCardTablet]} 
      activeOpacity={0.8}
    >
      <View style={styles.tipHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }, isTablet && styles.iconContainerTablet]}>
          <tip.icon size={isTablet ? 28 : 24} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={[styles.tipTitle, { color: colors.text }, isTablet && styles.tipTitleTablet]}>{tip.title}</Text>
      </View>
      <Text style={[styles.tipDescription, { color: colors.textSecondary }, isTablet && styles.tipDescriptionTablet]}>{tip.description}</Text>
    </TouchableOpacity>
  );

  const renderTipsGrid = () => {
    if (!isLargeScreen) {
      return securityTips.map(renderSecurityTip);
    }

    const rows = [];
    for (let i = 0; i < securityTips.length; i += 2) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          {renderSecurityTip(securityTips[i])}
          {securityTips[i + 1] && renderSecurityTip(securityTips[i + 1])}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('securityTitle')}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('securitySubtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.warningCard, { backgroundColor: '#2A1A00', borderColor: colors.warning }, isTablet && styles.warningCardTablet]}>
          <AlertTriangle size={isTablet ? 32 : 28} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.warningText, { color: colors.warning }, isTablet && styles.warningTextTablet]}>
            সাইবার নিরাপত্তা আজকের যুগে অত্যন্ত গুরুত্বপূর্ণ। নিচের টিপসগুলো অনুসরণ করে আপনার ডিজিটাল জীবনকে নিরাপদ রাখুন।
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          {renderTipsGrid()}
        </View>

        <View style={[styles.additionalInfo, { backgroundColor: colors.surface, borderColor: colors.primary }, isTablet && styles.additionalInfoTablet]}>
          <Text style={[styles.infoTitle, { color: colors.primary }, isTablet && styles.infoTitleTablet]}>অতিরিক্ত তথ্য</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }, isTablet && styles.infoTextTablet]}>
            সাইবার নিরাপত্তা একটি চলমান প্রক্রিয়া। নিয়মিত Bug Mohol এর খবর পড়ুন এবং নতুন নিরাপত্তা হুমকি সম্পর্কে জানুন। আপনার পরিবার ও বন্ধুদের সাথে এই টিপসগুলো শেয়ার করুন।
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
  headerSubtitle: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
  content: {
    padding: isTablet ? 32 : 16,
    paddingBottom: 100,
  },
  warningCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
  },
  warningCardTablet: {
    padding: 24,
    borderRadius: 16,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontFamily: 'NotoSansBengali-Regular',
  },
  warningTextTablet: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 16,
  },
  tipsContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    flex: isLargeScreen ? 1 : undefined,
    marginHorizontal: isLargeScreen ? 8 : 0,
  },
  tipCardTablet: {
    padding: 20,
    borderRadius: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: 'NotoSansBengali-Bold',
  },
  tipTitleTablet: {
    fontSize: 18,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'NotoSansBengali-Regular',
  },
  tipDescriptionTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  additionalInfo: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
  },
  additionalInfoTablet: {
    padding: 24,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'NotoSansBengali-Bold',
  },
  infoTitleTablet: {
    fontSize: 22,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'NotoSansBengali-Regular',
  },
  infoTextTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
});