import { Article } from '@/types/Article';

class NewsServiceClass {
  private articles: Article[] = [];
  private lastFetchTime: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  async fetchArticles(forceRefresh: boolean = false): Promise<Article[]> {
    const now = Date.now();
    
    // Return cached articles if not forcing refresh and cache is still valid
    if (!forceRefresh && this.articles.length > 0 && (now - this.lastFetchTime) < this.cacheTimeout) {
      return this.articles;
    }

    try {
      // Use our own API route instead of external CORS proxy
      const response = await fetch('/api/rss', {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml',
          'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const articles = this.parseRSSFeed(xmlText);
      
      if (articles.length === 0) {
        throw new Error('No articles found in RSS feed');
      }
      
      this.articles = articles;
      this.lastFetchTime = now;
      
      return articles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      
      // Return cached articles if available, otherwise throw error
      if (this.articles.length > 0) {
        return this.articles;
      }
      
      throw new Error('Failed to fetch articles. Please check your internet connection.');
    }
  }

  // Get article by ID
  getArticleById(id: string): Article | null {
    return this.articles.find(article => article.id === id) || null;
  }

  private parseRSSFeed(xmlText: string): Article[] {
    try {
      // Simple XML parsing for RSS feed
      const items = this.extractItemsFromXML(xmlText);
      
      if (items.length === 0) {
        console.warn('No items found in RSS feed');
        return [];
      }
      
      const articles: Article[] = [];
      
      // Fallback professional cybersecurity images (only used if no image found in post)
      const fallbackImages = [
        'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5240547/pexels-photo-5240547.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=800',
      ];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const title = this.extractTextContent(item, 'title');
          const description = this.extractTextContent(item, 'description');
          const link = this.extractTextContent(item, 'link');
          const pubDate = this.extractTextContent(item, 'pubDate');
          const guid = this.extractTextContent(item, 'guid');
          
          // Extract content from CDATA or description
          let content = description;
          const contentEncoded = this.extractTextContent(item, 'content:encoded');
          if (contentEncoded) {
            content = contentEncoded;
          }
          
          // Extract real image from the post content
          let imageUrl = this.extractImageFromContent(content);
          
          // If no real image found, use fallback
          if (!imageUrl) {
            imageUrl = fallbackImages[i % fallbackImages.length];
          }

          if (title && link) {
            articles.push({
              id: this.generateId(guid, link, i),
              title: this.cleanHtml(title),
              description: this.cleanHtml(description).substring(0, 200) + '...',
              content: this.cleanHtml(content),
              link,
              pubDate: this.formatDate(pubDate),
              imageUrl,
              category: this.extractCategory(title, content) || 'সাইবার নিরাপত্তা',
            });
          }
        } catch (itemError) {
          console.warn('Error parsing RSS item:', itemError);
        }
      }

      return articles;
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      throw error;
    }
  }

  private extractImageFromContent(content: string): string | null {
    if (!content) return null;

    // Multiple strategies to extract images from content
    const imagePatterns = [
      // Standard img tags
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      // Blogger/Blogspot specific patterns
      /<a[^>]+href=["']([^"']*\.(?:jpg|jpeg|png|gif|webp)[^"']*)["'][^>]*>/gi,
      // Direct image URLs in content
      /https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"]*)?/gi,
      // Blogger thumbnail patterns
      /s\d+-c\/([^"'\s]+\.(?:jpg|jpeg|png|gif|webp))/gi,
    ];

    for (const pattern of imagePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        let imageUrl = match[1] || match[0];
        
        // Clean up the URL
        imageUrl = imageUrl.trim();
        
        // Skip very small images (likely icons)
        if (imageUrl.includes('s72-c') || imageUrl.includes('s32-c') || imageUrl.includes('favicon')) {
          continue;
        }
        
        // Convert Blogger thumbnail URLs to larger versions
        if (imageUrl.includes('blogspot.com') || imageUrl.includes('blogger.com')) {
          // Replace small size indicators with larger ones
          imageUrl = imageUrl.replace(/s\d+-c/g, 's800-c');
          imageUrl = imageUrl.replace(/=s\d+/g, '=s800');
        }
        
        // Ensure HTTPS
        if (imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }
        
        // Validate URL format
        if (this.isValidImageUrl(imageUrl)) {
          return imageUrl;
        }
      }
    }

    return null;
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      return validExtensions.some(ext => pathname.includes(ext)) && 
             (urlObj.protocol === 'https:' || urlObj.protocol === 'http:');
    } catch {
      return false;
    }
  }

  private extractItemsFromXML(xmlText: string): any[] {
    const items: any[] = [];
    
    // Simple regex-based XML parsing for RSS items
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      items.push(match[1]);
    }
    
    return items;
  }

  private extractTextContent(itemXml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = itemXml.match(regex);
    
    if (match && match[1]) {
      // Handle CDATA sections
      const cdataMatch = match[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
      if (cdataMatch) {
        return cdataMatch[1].trim();
      }
      return match[1].trim();
    }
    
    return '';
  }

  private generateId(guid: string, link: string, index: number): string {
    // Use guid as primary identifier if available and valid
    if (guid && guid.trim() && !guid.includes('isPermaLink')) {
      return `${guid.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50)}-${index}`;
    }
    
    // Use link as fallback identifier
    if (link && link.trim()) {
      // Extract meaningful part from URL and create stable ID
      const urlParts = link.split('/').filter(part => part.length > 0);
      const lastPart = urlParts[urlParts.length - 1] || '';
      const cleanPart = lastPart.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 30);
      return cleanPart ? `link-${cleanPart}-${index}` : `url-${index}-${Date.now()}`;
    }
    
    // Final fallback
    return `article-${index}-${Date.now()}`;
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private extractCategory(title: string, content: string): string | null {
    const categories = [
      { bn: 'হ্যাকিং', keywords: ['hack', 'hacking', 'hacker', 'হ্যাক', 'হ্যাকিং', 'হ্যাকার'] },
      { bn: 'ম্যালওয়্যার', keywords: ['malware', 'virus', 'trojan', 'ম্যালওয়্যার', 'ভাইরাস'] },
      { bn: 'ফিশিং', keywords: ['phishing', 'scam', 'fraud', 'ফিশিং', 'প্রতারণা'] },
      { bn: 'র‍্যানসমওয়্যার', keywords: ['ransomware', 'ransom', 'র‍্যানসমওয়্যার', 'মুক্তিপণ'] },
      { bn: 'সাইবার আক্রমণ', keywords: ['cyber attack', 'cyberattack', 'breach', 'সাইবার আক্রমণ', 'আক্রমণ'] },
      { bn: 'ডেটা ব্রিচ', keywords: ['data breach', 'leak', 'ডেটা ব্রিচ', 'তথ্য ফাঁস'] },
    ];
    
    const searchText = `${title} ${content}`.toLowerCase();
    
    for (const category of categories) {
      if (category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return category.bn;
      }
    }
    return null;
  }

  private cleanHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Get articles by category
  getArticlesByCategory(category: string): Article[] {
    return this.articles.filter(article => article.category === category);
  }

  // Search articles
  searchArticles(query: string): Article[] {
    const lowerQuery = query.toLowerCase();
    return this.articles.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const NewsService = new NewsServiceClass();