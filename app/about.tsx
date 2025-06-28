import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Globe, Mail, Shield, Users, Target, Award, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const openWebsite = () => {
    Linking.openURL('https://www.bugmohol.com');
  };

  const contactEmail = () => {
    Linking.openURL('mailto:info@bugmohol.com');
  };

  const features = [
    {
      icon: Shield,
      title: 'সাইবার নিরাপত্তা',
      description: 'বাংলাদেশের সাইবার নিরাপত্তা বিষয়ক সর্বশেষ খবর ও আপডেট',
    },
    {
      icon: Target,
      title: 'নির্ভরযোগ্য তথ্য',
      description: 'যাচাইকৃত এবং বিশ্বস্ত সূত্র থেকে সংগৃহীত খবর',
    },
    {
      icon: Users,
      title: 'কমিউনিটি',
      description: 'সাইবার নিরাপত্তা বিশেষজ্ঞ ও উৎসাহীদের একটি সক্রিয় কমিউনিটি',
    },
    {
      icon: Award,
      title: 'বিশেষজ্ঞ বিশ্লেষণ',
      description: 'অভিজ্ঞ সাইবার নিরাপত্তা বিশেষজ্ঞদের দ্বারা বিশ্লেষিত খবর',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={isTablet ? 26 : 24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bug Mohol সম্পর্কে</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.logoSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.logoContainer, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Shield size={isTablet ? 64 : 48} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>Bug Mohol</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>সাইবার দুনিয়ার অন্ধকার খবর</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>সংস্করণ 1.0.0</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>আমাদের মিশন</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Bug Mohol এর লক্ষ্য হলো বাংলাদেশের মানুষদের সাইবার নিরাপত্তা সম্পর্কে সচেতন করা এবং 
            সর্বশেষ সাইবার হুমকি ও নিরাপত্তা সংক্রান্ত খবর পৌঁছে দেওয়া। আমরা বিশ্বাস করি যে 
            সঠিক তথ্য ও সচেতনতার মাধ্যমে আমরা একটি নিরাপদ ডিজিটাল বাংলাদেশ গড়তে পারি।
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>বৈশিষ্ট্যসমূহ</Text>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.background }]}>
                <feature.icon size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>যোগাযোগ</Text>
          
          <TouchableOpacity 
            style={[styles.contactItem, { borderColor: colors.border }]}
            onPress={openWebsite}
          >
            <Globe size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.contactText, { color: colors.text }]}>www.bugmohol.com</Text>
            <ExternalLink size={16} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactItem, { borderColor: colors.border }]}
            onPress={contactEmail}
          >
            <Mail size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.contactText, { color: colors.text }]}>info@bugmohol.com</Text>
            <ExternalLink size={16} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ডেভেলপার তথ্য</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            এই অ্যাপটি React Native এবং Expo ব্যবহার করে তৈরি করা হয়েছে। আমরা ব্যবহারকারীদের 
            গোপনীয়তা এবং ডেটা নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দিয়ে থাকি।
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>কৃতজ্ঞতা</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            আমাদের সাইবার নিরাপত্তা কমিউনিটির সকল সদস্য, অবদানকারী এবং ব্যবহারকারীদের 
            ধন্যবাদ যারা Bug Mohol কে আরও ভালো করতে সাহায্য করেছেন।
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    elevation: 2,
  },
  backButton: {
    padding: isTablet ? 10 : 8,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSansBengali-Bold',
  },
  placeholder: {
    width: isTablet ? 44 : 40,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    padding: isTablet ? 32 : 24,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  logoContainer: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 20 : 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  appName: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
  tagline: {
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'NotoSansBengali-Regular',
  },
  version: {
    fontSize: isTablet ? 16 : 14,
    fontFamily: 'NotoSansBengali-Regular',
  },
  section: {
    padding: isTablet ? 24 : 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Bold',
  },
  sectionText: {
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 24 : 22,
    fontFamily: 'NotoSansBengali-Regular',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  featureDescription: {
    fontSize: isTablet ? 14 : 13,
    lineHeight: isTablet ? 20 : 18,
    fontFamily: 'NotoSansBengali-Regular',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    marginLeft: 12,
    fontFamily: 'NotoSansBengali-Regular',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: isTablet ? 14 : 12,
    textAlign: 'center',
    fontFamily: 'NotoSansBengali-Regular',
  },
});