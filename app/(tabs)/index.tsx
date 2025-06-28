import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Share, ExternalLink, TrendingUp, Zap, TriangleAlert as AlertTriangle, Search, Filter, Bell, Bookmark, Eye, MessageCircle, ChevronRight, Grid3x3 as Grid3X3, List, Users, Star } from 'lucide-react-native';
import { NewsService } from '@/services/NewsService';
import { Article } from '@/types/Article';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;
const isExtraLarge = width >= 1440;

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'general' | 'server'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [realtimeViews, setRealtimeViews] = useState<{[key: string]: number}>({});
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const categories = [
    t('all'),
    t('hacking'),
    t('malware'),
    t('phishing'),
    t('ransomware'),
    t('cyberAttack'),
    t('dataBreach')
  ];

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Simulate realtime view counts
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeViews(prev => {
        const newViews = { ...prev };
        articles.forEach(article => {
          if (!newViews[article.id]) {
            newViews[article.id] = Math.floor(Math.random() * 500) + 100;
          } else {
            // Randomly increment views
            if (Math.random() > 0.7) {
              newViews[article.id] += Math.floor(Math.random() * 5) + 1;
            }
          }
        });
        return newViews;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [articles]);

  const loadArticles = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      setErrorType('general');
      if (forceRefresh) {
        setRefreshing(true);
      }
      
      const fetchedArticles = await NewsService.fetchArticles(forceRefresh);
      setArticles(fetchedArticles);
      setFilteredArticles(fetchedArticles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Determine error type based on error message
      if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('internet')) {
        setErrorType('network');
        setError('ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।');
      } else if (errorMessage.includes('server') || errorMessage.includes('HTTP')) {
        setErrorType('server');
        setError('সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setErrorType('general');
        setError('খবর লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
      
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    
    // Set up auto-refresh every 10 minutes
    const interval = setInterval(() => {
      loadArticles(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadArticles]);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, selectedCategory, articles]);

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== t('all')) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  };

  const onRefresh = useCallback(() => {
    loadArticles(true);
  }, [loadArticles]);

  const shareArticle = async (article: Article) => {
    try {
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(article.link, {
          dialogTitle: article.title,
        });
      } else if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: article.title,
            text: article.description,
            url: article.link,
          });
        } else {
          await navigator.clipboard.writeText(article.link);
          // Show a toast or alert instead of alert
          console.log('Link copied to clipboard');
        }
      }
    } catch (err) {
      console.log('Error sharing:', err);
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

  const getColumnsForScreen = () => {
    if (isExtraLarge) return 4;
    if (isLargeScreen) return 3;
    if (isTablet) return 2;
    return 1;
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.brandHeader}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <AlertTriangle size={isTablet ? 32 : 28} color={colors.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.brandTextContainer}>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>{t('brandTitle')}</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>{t('brandSubtitle')}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Bell size={isTablet ? 22 : 20} color={colors.text} strokeWidth={2} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.liveIndicator, { backgroundColor: colors.primary }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('live')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Filter size={20} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.viewModeButton, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            viewMode === 'grid' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? (
            <List size={20} color={viewMode === 'grid' ? "#FFFFFF" : colors.primary} strokeWidth={2} />
          ) : (
            <Grid3X3 size={20} color={viewMode === 'list' ? "#FFFFFF" : colors.primary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: colors.textSecondary },
              selectedCategory === category && { color: '#FFFFFF' }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Users size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {Object.values(realtimeViews).reduce((sum, views) => sum + views, 0).toLocaleString()} {t('readersOnline')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <TrendingUp size={16} color={colors.success} strokeWidth={2} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>{filteredArticles.length} {t('newsCount')}</Text>
        </View>
      </View>
    </View>
  );

  const renderFeaturedArticle = () => {
    if (filteredArticles.length === 0) return null;
    
    const featuredArticle = filteredArticles[0];
    const views = realtimeViews[featuredArticle.id] || 0;
    
    return (
      <View style={styles.featuredContainer}>
        <View style={styles.featuredHeader}>
          <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
            <Star size={14} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
            <Text style={styles.featuredText}>{t('featured')}</Text>
          </View>
          <View style={[styles.trendingBadge, { backgroundColor: colors.success }]}>
            <TrendingUp size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.trendingText}>{t('trending')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.featuredCard, { shadowColor: colors.primary }]}
          onPress={() => openArticle(featuredArticle)}
          activeOpacity={0.95}
        >
          <Image
            source={{ uri: featuredArticle.imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
            onError={() => console.log('Featured image failed to load:', featuredArticle.imageUrl)}
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredContent}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{featuredArticle.category}</Text>
              </View>
              <Text style={styles.featuredTitle} numberOfLines={isTablet ? 3 : 2}>
                {featuredArticle.title}
              </Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredArticle.description}
              </Text>
              <View style={styles.featuredMeta}>
                <View style={styles.timeContainer}>
                  <Clock size={12} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.featuredTime}>
                    {formatTimeAgo(featuredArticle.pubDate)}
                  </Text>
                </View>
                <View style={styles.engagementContainer}>
                  <Eye size={12} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.engagementText}>{views.toLocaleString()}</Text>
                  <MessageCircle size={12} color="#FFFFFF" strokeWidth={2} style={{ marginLeft: 12 }} />
                  <Text style={styles.engagementText}>{Math.floor(views * 0.1)}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGridArticle = ({ item: article, index }: { item: Article; index: number }) => {
    // Skip the first article as it's featured
    if (index === 0) return null;

    const views = realtimeViews[article.id] || 0;
    const isLargeCard = (index - 1) % 6 === 0 || (index - 1) % 6 === 3;
    const cardStyle = viewMode === 'list' ? [styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }] : 
                     (isLargeCard && isTablet) ? [styles.largeGridCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary }] : 
                     [styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary }];
    const imageStyle = viewMode === 'list' ? styles.listImage : 
                      (isLargeCard && isTablet) ? styles.largeGridImage : styles.gridImage;

    return (
      <TouchableOpacity
        style={[cardStyle, isTablet && styles.gridCardTablet]}
        onPress={() => openArticle(article)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={[imageStyle, isTablet && styles.gridImageTablet]}
            resizeMode="cover"
            onError={() => console.log('Article image failed to load:', article.imageUrl)}
          />
          {Math.random() > 0.8 && (
            <View style={[styles.urgencyBadge, { backgroundColor: colors.primary }]}>
              <Zap size={10} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.urgencyText}>জরুরি</Text>
            </View>
          )}
          <View style={styles.viewsBadge}>
            <Eye size={10} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.viewsText}>{views > 1000 ? `${(views/1000).toFixed(1)}k` : views}</Text>
          </View>
        </View>
        <View style={styles.gridContent}>
          <View style={styles.gridHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={10} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.gridTime, { color: colors.textSecondary }]}>
                {formatTimeAgo(article.pubDate)}
              </Text>
            </View>
          </View>
          <Text style={[styles.gridTitle, { color: colors.text }, isTablet && styles.gridTitleTablet]} numberOfLines={viewMode === 'list' ? 2 : 3}>
            {article.title}
          </Text>
          {(viewMode === 'list' || (isLargeCard && isTablet)) && (
            <Text style={[styles.gridDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {article.description}
            </Text>
          )}
          <View style={styles.gridMeta}>
            <View style={styles.engagementContainer}>
              <Eye size={12} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.gridEngagement, { color: colors.textSecondary }]}>{views.toLocaleString()}</Text>
              <MessageCircle size={12} color={colors.textSecondary} strokeWidth={2} style={{ marginLeft: 8 }} />
              <Text style={[styles.gridEngagement, { color: colors.textSecondary }]}>{Math.floor(views * 0.1)}</Text>
            </View>
            <View style={styles.gridActions}>
              <TouchableOpacity
                style={styles.gridActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  shareArticle(article);
                }}
              >
                <Share size={14} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridActionButton}
                onPress={() => openArticle(article)}
              >
                <ExternalLink size={14} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ErrorMessage 
          message={error} 
          onRetry={() => loadArticles(true)}
          type={errorType}
        />
      </SafeAreaView>
    );
  }

  const numColumns = viewMode === 'list' ? 1 : getColumnsForScreen();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredArticles}
        renderItem={renderGridArticle}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={numColumns}
        key={`${viewMode}-${numColumns}`}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        ListHeaderComponent={() => (
          <View>
            {renderHeader()}
            {renderFeaturedArticle()}
            {filteredArticles.length > 1 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <TrendingUp size={20} color={colors.primary} strokeWidth={2.5} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('latestNews')}</Text>
                  </View>
                  <Text style={[styles.articleCount, { color: colors.textSecondary }]}>
                    {filteredArticles.length - 1} {t('newsCount')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.articlesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 16 : 8,
  },
  headerContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 16 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    fontFamily: 'NotoSansBengali-Bold',
  },
  brandSubtitle: {
    fontSize: isTablet ? 14 : 12,
    fontFamily: 'NotoSansBengali-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'NotoSansBengali-Bold',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 12 : 10,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: 16,
    elevation: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    fontSize: isTablet ? 11 : 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: isTablet ? 32 : 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 14 : 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: isTablet ? 18 : 16,
    fontFamily: 'NotoSansBengali-Regular',
  },
  filterButton: {
    width: isTablet ? 52 : 48,
    height: isTablet ? 52 : 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  viewModeButton: {
    width: isTablet ? 52 : 48,
    height: isTablet ? 52 : 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoriesContainer: {
    paddingLeft: isTablet ? 32 : 20,
  },
  categoriesContent: {
    paddingRight: isTablet ? 32 : 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 10 : 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    fontFamily: 'NotoSansBengali-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 6,
    fontFamily: 'NotoSansBengali-Regular',
  },
  statDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 16,
  },
  featuredContainer: {
    marginTop: 20,
    marginHorizontal: isTablet ? 32 : 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'NotoSansBengali-Bold',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: isTablet ? 320 : 240,
    backgroundColor: '#2D2D2D',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: isTablet ? 24 : 20,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: isTablet ? 32 : 26,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'NotoSansBengali-Bold',
  },
  featuredDescription: {
    fontSize: isTablet ? 16 : 14,
    color: '#E0E0E0',
    lineHeight: isTablet ? 22 : 20,
    marginBottom: 12,
    fontFamily: 'NotoSansBengali-Regular',
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTime: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
  sectionContainer: {
    marginTop: 24,
    marginHorizontal: isTablet ? 32 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'NotoSansBengali-Bold',
  },
  articleCount: {
    fontSize: 14,
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
  articlesList: {
    paddingBottom: 100,
  },
  gridCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  gridCardTablet: {
    marginHorizontal: 8,
  },
  largeGridCard: {
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    flex: 1,
    marginHorizontal: 8,
  },
  listCard: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: isTablet ? 32 : 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#2D2D2D',
  },
  gridImageTablet: {
    height: 160,
  },
  largeGridImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2D2D2D',
  },
  listImage: {
    width: 120,
    height: 120,
    backgroundColor: '#2D2D2D',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  viewsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Bold',
  },
  gridContent: {
    padding: isTablet ? 16 : 12,
    flex: 1,
  },
  gridHeader: {
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
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
    marginBottom: 6,
    fontFamily: 'NotoSansBengali-Bold',
  },
  gridTitleTablet: {
    fontSize: 16,
    lineHeight: 22,
  },
  gridDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: 'NotoSansBengali-Regular',
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridTime: {
    fontSize: 10,
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
  gridActions: {
    flexDirection: 'row',
  },
  gridActionButton: {
    padding: 6,
    marginLeft: 4,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
  gridEngagement: {
    fontSize: 10,
    marginLeft: 4,
    fontFamily: 'NotoSansBengali-Regular',
  },
});