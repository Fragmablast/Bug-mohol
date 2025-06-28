import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TriangleAlert as AlertTriangle, RefreshCw, Mail, Wifi } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'network' | 'general' | 'server';
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  showRetry = true, 
  type = 'general' 
}: ErrorMessageProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return Wifi;
      case 'server':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'ইন্টারনেট সংযোগ নেই';
      case 'server':
        return 'সার্ভার সমস্যা';
      default:
        return 'কিছু সমস্যা হয়েছে';
    }
  };

  const getErrorDescription = () => {
    switch (type) {
      case 'network':
        return 'আপনার ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।';
      case 'server':
        return 'সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      default:
        return 'দয়া করে আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।';
    }
  };

  const ErrorIcon = getErrorIcon();

  const contactSupport = () => {
    // In a real app, this would open email client or support page
    console.log('Contact support');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <ErrorIcon size={isTablet ? 64 : 48} color={colors.error} strokeWidth={1.5} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{getErrorTitle()}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{getErrorDescription()}</Text>
        
        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]} 
              onPress={onRetry} 
              activeOpacity={0.8}
            >
              <RefreshCw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.supportButton, { borderColor: colors.primary }]} 
            onPress={contactSupport} 
            activeOpacity={0.8}
          >
            <Mail size={16} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.supportText, { color: colors.primary }]}>{t('contactSupport')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 20,
  },
  errorCard: {
    borderRadius: 16,
    padding: isTablet ? 40 : 30,
    alignItems: 'center',
    maxWidth: isTablet ? 500 : 350,
    width: '100%',
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Bold',
  },
  message: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: isTablet ? 24 : 20,
    fontFamily: 'NotoSansBengali-Regular',
  },
  description: {
    fontSize: isTablet ? 14 : 12,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: isTablet ? 20 : 18,
    fontFamily: 'NotoSansBengali-Regular',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 12,
    elevation: 2,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 12,
  },
  supportText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
});