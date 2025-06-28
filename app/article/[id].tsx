import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  Image,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Share, Bookmark, ExternalLink, Clock, Eye, MessageCircle, Star, TrendingUp } from 'lucide-react-native';
import { StorageService } from '@/services/StorageService';
import { NewsService } from '@/services/NewsService';
import { Article } from '@/types/Article';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ArticleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const articleId = params.id as string;

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === 'android') {
        if (showWebView) {
          setShowWebView(false);
          return true;
        } else {
          router.back();
          return true;
        }
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showWebView, router]);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  useEffect(() => {
    if (article) {
      checkIfSaved();
    }
  }, [article]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedArticle = NewsService.getArticleById(articleId);
      
      if (!fetchedArticle) {
        // If article not found in cache, try to fetch articles first
        await NewsService.fetchArticles();
        const retryArticle = NewsService.getArticleById(articleId);
        
        if (!retryArticle) {
          throw new Error('Article not found');
        }
        
        setArticle(retryArticle);
      } else {
        setArticle(fetchedArticle);
      }
    } catch (err) {
      setError('খবরটি লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      console.error('Error loading article:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!article) return;
    
    try {
      const saved = await StorageService.isArticleSaved(article.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if article is saved:', error);
    }
  };

  const toggleSave = async () => {
    if (!article) return;
    
    try {
      if (isSaved) {
        await StorageService.removeArticle(article.id);
        setIsSaved(false);
        Alert.alert(t('success'), t('articleRemoved'));
      } else {
        await StorageService.saveArticle(article);
        setIsSaved(true);
        Alert.alert(t('success'), t('articleSaved'));
      }
    } catch (error) {
      Alert.alert(t('error'), 'খবর সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  const shareArticle = async () => {
    if (!article) return;
    
    try {
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(article.link, {
          dialogTitle: article.title,
        });
      } else if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: article.title,
            text: article.content.substring(0, 200) + '...',
            url: article.link,
          });
        } else {
          await navigator.clipboard.writeText(article.link);
          Alert.alert(t('success'), 'লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে');
        }
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const openInBrowser = () => {
    setShowWebView(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24) return `${diffInHours} ${t('hoursAgo')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${t('daysAgo')}`;
    
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={isTablet ? 26 : 24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={isTablet ? 26 : 24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ErrorMessage 
          message={error || 'খবরটি পাওয়া যায়নি'} 
          onRetry={loadArticle}
        />
      </SafeAreaView>
    );
  }

  if (showWebView) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.webViewHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowWebView(false)}
          >
            <ArrowLeft size={isTablet ? 26 : 24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.webViewTitle, { color: colors.text }, isTablet && styles.webViewTitleTablet]} numberOfLines={1}>
            {article.title}
          </Text>
        </View>
        <WebView
          source={{ uri: article.link }}
          style={styles.webView}
          startInLoadingState
          scalesPageToFit
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={isTablet ? 26 : 24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={shareArticle}
          >
            <Share size={isTablet ? 22 : 20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSave}
          >
            <Bookmark 
              size={isTablet ? 22 : 20} 
              color={isSaved ? colors.primary : colors.text}
              fill={isSaved ? colors.primary : "none"}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openInBrowser}
          >
            <ExternalLink size={isTablet ? 22 : 20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {article.imageUrl && !imageError && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: article.imageUrl }}
              style={[styles.articleImage, isTablet && styles.articleImageTablet]}
              resizeMode="cover"
              onError={() => {
                console.log('Article image failed to load:', article.imageUrl);
                setImageError(true);
              }}
            />
            <View style={styles.imageOverlay}>
              <View style={[styles.qualityBadge, { backgroundColor: colors.primary }]}>
                <Star size={12} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                <Text style={styles.qualityText}>উচ্চ মানের</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.articleHeader}>
          <View style={styles.articleMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.categoryText, isTablet && styles.categoryTextTablet]}>{article.category}</Text>
            </View>
            <View style={styles.metaInfo}>
              <View style={styles.timeContainer}>
                <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.publishDate, { color: colors.textSecondary }, isTablet && styles.publishDateTablet]}>
                  {formatTimeAgo(article.pubDate)}
                </Text>
              </View>
              <View style={styles.engagementContainer}>
                <Eye size={12} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.engagementText, { color: colors.textSecondary }]}>
                  {Math.floor(Math.random() * 500) + 100}
                </Text>
                <MessageCircle size={12} color={colors.textSecondary} strokeWidth={2} style={{ marginLeft: 12 }} />
                <Text style={[styles.engagementText, { color: colors.textSecondary }]}>
                  {Math.floor(Math.random() * 50) + 10}
                </Text>
                <TrendingUp size={12} color={colors.success} strokeWidth={2} style={{ marginLeft: 12 }} />
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.articleTitle, { color: colors.text }, isTablet && styles.articleTitleTablet]}>{article.title}</Text>
        
        <Text style={[styles.articleDescription, { color: colors.textSecondary }, isTablet && styles.articleDescriptionTablet]}>
          {article.description}
        </Text>

        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.contentHeader}>
            <Text style={[styles.contentLabel, { color: colors.primary }]}>সম্পূর্ণ খবর</Text>
            <View style={[styles.premiumBadge, { backgroundColor: colors.success }]}>
              <Star size={10} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
              <Text style={styles.premiumText}>প্রিমিয়াম</Text>
            </View>
          </View>
          <Text style={[styles.contentText, { color: colors.text }, isTablet && styles.contentTextTablet]}>{article.content}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.readFullButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, isTablet && styles.readFullButtonTablet]}
          onPress={openInBrowser}
        >
          <ExternalLink size={isTablet ? 18 : 16} color="#FFFFFF" strokeWidth={2} />
          <Text style={[styles.readFullButtonText, isTablet && styles.readFullButtonTextTablet]}>{t('readFull')}</Text>
        </TouchableOpacity>

        <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>সূত্র</Text>
          <Text style={[styles.sourceText, { color: colors.primary }]}>Bug Mohol - bugmohol.com</Text>
          <Text style={[styles.sourceNote, { color: colors.textSecondary }]}>
            এই খবরটি Bug Mohol এর অফিসিয়াল ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে। সম্পূর্ণ খবর পড়তে উপরের বাটনে ক্লিক করুন।
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
  headerButton: {
    padding: isTablet ? 10 : 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    elevation: 2,
  },
  webViewTitle: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
    fontFamily: 'NotoSansBengali-Regular',
  },
  webViewTitleTablet: {
    fontSize: 18,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: isTablet ? 18 : 16,
    fontFamily: 'NotoSansBengali-Regular',
  },
  content: {
    paddingBottom: 100,
  },
  imageWrapper: {
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#2D2D2D',
  },
  articleImageTablet: {
    height: 320,
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  articleHeader: {
    padding: isTablet ? 32 : 20,
    paddingBottom: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali-Bold',
  },
  categoryTextTablet: {
    fontSize: 14,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'NotoSansBengali-Regular',
  },
  publishDateTablet: {
    fontSize: 14,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    fontSize: 11,
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
  articleTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 16,
    paddingHorizontal: isTablet ? 32 : 20,
    fontFamily: 'NotoSansBengali-Bold',
  },
  articleTitleTablet: {
    fontSize: 32,
    lineHeight: 42,
    marginBottom: 20,
  },
  articleDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: isTablet ? 32 : 20,
    fontFamily: 'NotoSansBengali-Regular',
    fontStyle: 'italic',
  },
  articleDescriptionTablet: {
    fontSize: 18,
    lineHeight: 28,
  },
  contentCard: {
    marginHorizontal: isTablet ? 32 : 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'NotoSansBengali-Bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    padding: 16,
    fontFamily: 'NotoSansBengali-Regular',
  },
  contentTextTablet: {
    fontSize: 18,
    lineHeight: 30,
  },
  readFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: isTablet ? 32 : 20,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  readFullButtonTablet: {
    padding: 20,
    borderRadius: 16,
  },
  readFullButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
  readFullButtonTextTablet: {
    fontSize: 18,
  },
  sourceCard: {
    marginHorizontal: isTablet ? 32 : 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  sourceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
  sourceNote: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'NotoSansBengali-Regular',
  },
});