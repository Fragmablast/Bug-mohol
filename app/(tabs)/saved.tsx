import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Trash2, ExternalLink, BookOpen } from 'lucide-react-native';
import { StorageService } from '@/services/StorageService';
import { Article } from '@/types/Article';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

export default function SavedScreen() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();

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

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    try {
      setLoading(true);
      const articles = await StorageService.getSavedArticles();
      setSavedArticles(articles);
    } catch (error) {
      console.error('Error loading saved articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeArticle = async (articleId: string) => {
    try {
      await StorageService.removeArticle(articleId);
      setSavedArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error removing article:', error);
    }
  };

  const openArticle = (article: Article) => {
    router.push({
      pathname: '/article/[id]',
      params: { 
        id: article.id,
      }
    });
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

  const renderArticle = ({ item: article }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }, isTablet && styles.articleCardTablet]}
      onPress={() => openArticle(article)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardContent, isTablet && styles.cardContentTablet]}>
        <Image
          source={{ uri: article.imageUrl }}
          style={[styles.articleImage, isTablet && styles.articleImageTablet]}
          resizeMode="cover"
        />
        <View style={styles.articleInfo}>
          <View style={styles.articleHeader}>
            {article.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{article.category}</Text>
              </View>
            )}
            <View style={[styles.savedBadge, { backgroundColor: colors.success }]}>
              <BookOpen size={12} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.savedText}>{t('saved')}</Text>
            </View>
          </View>
          <Text style={[styles.articleTitle, { color: colors.text }, isTablet && styles.articleTitleTablet]} numberOfLines={isTablet ? 3 : 2}>
            {article.title}
          </Text>
          <Text style={[styles.articleDescription, { color: colors.textSecondary }]} numberOfLines={isTablet ? 3 : 2}>
            {article.description}
          </Text>
          <View style={styles.articleMeta}>
            <View style={styles.timeContainer}>
              <Clock size={14} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {formatTimeAgo(article.pubDate)}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => removeArticle(article.id)}
              >
                <Trash2 size={16} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openArticle(article)}
              >
                <ExternalLink size={16} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.primary }]}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('saved')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('saved')}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {savedArticles.length} {t('newsCount')} {t('saved')}
        </Text>
      </View>

      {savedArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={isTablet ? 80 : 64} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noSavedArticles')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            খবর সংরক্ষণ করতে হোম পেজ থেকে খবরে ক্লিক করুন এবং বুকমার্ক আইকনে ট্যাপ করুন
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          numColumns={isLargeScreen ? 2 : 1}
          key={isLargeScreen ? 'two-columns' : 'one-column'}
          columnWrapperStyle={isLargeScreen ? styles.row : undefined}
          contentContainerStyle={styles.articlesList}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 60 : 40,
  },
  emptyText: {
    fontSize: isTablet ? 24 : 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
    fontFamily: 'NotoSansBengali-Bold',
  },
  emptySubtext: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    lineHeight: isTablet ? 24 : 20,
    fontFamily: 'NotoSansBengali-Regular',
  },
  articlesList: {
    padding: isTablet ? 32 : 16,
    paddingBottom: 100,
  },
  articleCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleCardTablet: {
    marginHorizontal: isLargeScreen ? 0 : 16,
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardContentTablet: {
    flexDirection: isLargeScreen ? 'column' : 'row',
  },
  articleImage: {
    width: 120,
    height: 120,
    backgroundColor: '#2D2D2D',
  },
  articleImageTablet: {
    width: isLargeScreen ? '100%' : 140,
    height: isLargeScreen ? 160 : 140,
  },
  articleInfo: {
    flex: 1,
    padding: isTablet ? 20 : 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali-Bold',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
    fontFamily: 'NotoSansBengali-Bold',
  },
  articleTitleTablet: {
    fontSize: 18,
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: isTablet ? 14 : 13,
    marginBottom: 10,
    lineHeight: isTablet ? 20 : 18,
    fontFamily: 'NotoSansBengali-Regular',
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 6,
    fontFamily: 'NotoSansBengali-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#2A0A0A',
    borderRadius: 6,
  },
});