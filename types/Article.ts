export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  imageUrl?: string;
  category?: string;
}