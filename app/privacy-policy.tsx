import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const sections = [
    {
      icon: Eye,
      title: 'তথ্য সংগ্রহ',
      content: `আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:
      
• অ্যাপ ব্যবহারের তথ্য (কোন খবর পড়া হয়েছে, কতক্ষণ অ্যাপ ব্যবহার করা হয়েছে)
• ডিভাইসের তথ্য (অপারেটিং সিস্টেম, অ্যাপ সংস্করণ)
• ক্র্যাশ রিপোর্ট এবং পারফরমেন্স ডেটা
• সংরক্ষিত খবরের তালিকা (শুধুমাত্র স্থানীয়ভাবে সংরক্ষিত)

আমরা কোনো ব্যক্তিগত তথ্য যেমন নাম, ইমেইল, ফোন নম্বর সংগ্রহ করি না।`
    },
    {
      icon: Database,
      title: 'তথ্য ব্যবহার',
      content: `আমরা সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:

• অ্যাপের কার্যকারিতা উন্নত করতে
• ব্যবহারকারীর অভিজ্ঞতা বৃদ্ধি করতে
• প্রযুক্তিগত সমস্যা সমাধান করতে
• নতুন ফিচার ডেভেলপ করতে
• অ্যাপের নিরাপত্তা নিশ্চিত করতে

আমরা কখনোই আপনার তথ্য বিক্রি করি না বা তৃতীয় পক্ষের সাথে শেয়ার করি না।`
    },
    {
      icon: Lock,
      title: 'তথ্য নিরাপত্তা',
      content: `আমরা আপনার তথ্যের নিরাপত্তার জন্য নিম্নলিখিত ব্যবস্থা গ্রহণ করি:

• সকল ডেটা এনক্রিপ্ট করে সংরক্ষণ
• নিরাপদ HTTPS সংযোগ ব্যবহার
• নিয়মিত নিরাপত্তা অডিট
• সীমিত অ্যাক্সেস কন্ট্রোল
• আপডেটেড নিরাপত্তা প্রোটোকল

আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখা আমাদের সর্বোচ্চ অগ্রাধিকার।`
    },
    {
      icon: Users,
      title: 'তৃতীয় পক্ষের সেবা',
      content: `আমাদের অ্যাপ নিম্নলিখিত তৃতীয় পক্ষের সেবা ব্যবহার করে:

• RSS ফিড প্রদানকারী (Bug Mohol ওয়েবসাইট)
• ক্র্যাশ রিপোর্টিং সেবা
• অ্যানালিটিক্স সেবা (বেনামী ডেটা)

এই সেবাগুলোর নিজস্ব গোপনীয়তা নীতি রয়েছে যা আমরা মেনে চলি।`
    },
    {
      icon: Shield,
      title: 'আপনার অধিকার',
      content: `আপনার নিম্নলিখিত অধিকার রয়েছে:

• আপনার তথ্য দেখার অধিকার
• আপনার তথ্য সংশোধনের অধিকার
• আপনার তথ্য মুছে ফেলার অধিকার
• ডেটা প্রসেসিং বন্ধ করার অধিকার
• ডেটা পোর্টেবিলিটির অধিকার

এই অধিকারগুলো ব্যবহার করতে আমাদের সাথে যোগাযোগ করুন।`
    },
    {
      icon: AlertTriangle,
      title: 'নীতি পরিবর্তন',
      content: `আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। কোনো পরিবর্তন হলে:

• অ্যাপের মাধ্যমে নোটিফিকেশন পাঠানো হবে
• নতুন নীতি কার্যকর হওয়ার আগে জানানো হবে
• গুরুত্বপূর্ণ পরিবর্তনের জন্য আপনার সম্মতি নেওয়া হবে

সর্বশেষ আপডেট: ডিসেম্বর ২০২৪`
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>গোপনীয়তা নীতি</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.introSection, { backgroundColor: colors.surface }]}>
          <Shield size={isTablet ? 48 : 40} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.introTitle, { color: colors.text }]}>আপনার গোপনীয়তা আমাদের অগ্রাধিকার</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Bug Mohol অ্যাপ ব্যবহার করার সময় আপনার গোপনীয়তা এবং ব্যক্তিগত তথ্যের নিরাপত্তা 
            আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই নীতিতে আমরা কীভাবে আপনার তথ্য সংগ্রহ, 
            ব্যবহার এবং সুরক্ষিত রাখি তা ব্যাখ্যা করেছি।
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <section.icon size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
          </View>
        ))}

        <View style={[styles.contactSection, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>প্রশ্ন বা উদ্বেগ?</Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            এই গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন বা উদ্বেগ থাকলে আমাদের সাথে যোগাযোগ করুন:
          </Text>
          <Text style={[styles.contactEmail, { color: colors.primary }]}>privacy@bugmohol.com</Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            সর্বশেষ আপডেট: ডিসেম্বর ২০২৪
          </Text>
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
  introSection: {
    alignItems: 'center',
    padding: isTablet ? 32 : 24,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  introTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Bold',
  },
  introText: {
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 24 : 22,
    textAlign: 'center',
    fontFamily: 'NotoSansBengali-Regular',
  },
  section: {
    padding: isTablet ? 24 : 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: 'NotoSansBengali-Bold',
  },
  sectionContent: {
    fontSize: isTablet ? 15 : 14,
    lineHeight: isTablet ? 24 : 22,
    fontFamily: 'NotoSansBengali-Regular',
  },
  contactSection: {
    padding: isTablet ? 24 : 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    elevation: 2,
  },
  contactTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Bold',
  },
  contactText: {
    fontSize: isTablet ? 15 : 14,
    lineHeight: isTablet ? 22 : 20,
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Regular',
  },
  contactEmail: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: 'bold',
    fontFamily: 'NotoSansBengali-Bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: isTablet ? 14 : 12,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
});