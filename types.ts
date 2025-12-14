export enum ProductCategory {
  COURSE = 'Full Course',
  MINI_COURSE = 'Mini-Course',
  GUIDE = 'PDF Guide',
  GPT = 'Custom GPT',
  BUNDLE = 'Bundle',
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  popular?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  readTime: string;
  slug?: string;
  uri?: string;
  link?: string; // Full URL to the WordPress post
  categories?: BlogCategory[];
  author?: BlogAuthor;
  content?: string; // Full post content for detail pages
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}