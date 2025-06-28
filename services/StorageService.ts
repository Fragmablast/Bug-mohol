import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '@/types/Article';

const STORAGE_KEYS = {
  SAVED_ARTICLES: 'savedArticles',
  CACHE_DATA: 'cacheData',
};

class StorageServiceClass {
  async saveArticle(article: Article): Promise<void> {
    try {
      const savedArticles = await this.getSavedArticles();
      const updatedArticles = [article, ...savedArticles.filter(a => a.id !== article.id)];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(updatedArticles));
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  async getSavedArticles(): Promise<Article[]> {
    try {
      const savedArticlesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ARTICLES);
      return savedArticlesJson ? JSON.parse(savedArticlesJson) : [];
    } catch (error) {
      console.error('Error getting saved articles:', error);
      return [];
    }
  }

  async removeArticle(articleId: string): Promise<void> {
    try {
      const savedArticles = await this.getSavedArticles();
      const updatedArticles = savedArticles.filter(article => article.id !== articleId);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(updatedArticles));
    } catch (error) {
      console.error('Error removing article:', error);
      throw error;
    }
  }

  async isArticleSaved(articleId: string): Promise<boolean> {
    try {
      const savedArticles = await this.getSavedArticles();
      return savedArticles.some(article => article.id === articleId);
    } catch (error) {
      console.error('Error checking if article is saved:', error);
      return false;
    }
  }

  async clearSavedArticles(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_ARTICLES);
    } catch (error) {
      console.error('Error clearing saved articles:', error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHE_DATA);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async cacheArticles(articles: Article[]): Promise<void> {
    try {
      const cacheData = {
        articles,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE_DATA, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching articles:', error);
    }
  }

  async getCachedArticles(): Promise<Article[]> {
    try {
      const cacheDataJson = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_DATA);
      if (!cacheDataJson) return [];

      const cacheData = JSON.parse(cacheDataJson);
      const isExpired = Date.now() - cacheData.timestamp > 3600000; // 1 hour

      if (isExpired) {
        await this.clearCache();
        return [];
      }

      return cacheData.articles || [];
    } catch (error) {
      console.error('Error getting cached articles:', error);
      return [];
    }
  }
}

export const StorageService = new StorageServiceClass();