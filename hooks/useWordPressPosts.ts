/**
 * WordPress GraphQL Hook
 * 
 * Fetches blog posts from WordPress backend using GraphQL API
 */

import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/types';

interface WordPressCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface WordPressAuthor {
  id: string;
  name: string;
  slug: string;
}

interface WordPressPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      mediaDetails?: {
        width?: number;
        height?: number;
      };
    };
  };
  content?: string;
  readingTime?: number;
  slug?: string;
  uri?: string;
  categories?: {
    nodes?: WordPressCategory[];
  };
  author?: {
    node?: WordPressAuthor;
  };
}

interface WordPressResponse {
  posts?: {
    nodes?: WordPressPost[];
  };
  errors?: Array<{ message: string }>;
}

/**
 * Calculate reading time from content
 */
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Format date from WordPress format to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
}

export function useWordPressPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try both environment variable names for flexibility
      // Use Next.js API route to proxy WordPress requests (avoids CORS issues)
      const apiUrl = '/api/wordpress/posts';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control
        cache: 'no-store', // Always fetch fresh data on client
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.posts?.nodes) {
        throw new Error('No posts data returned from WordPress');
      }

      // Transform WordPress posts to BlogPost format
      const transformedPosts: BlogPost[] = result.posts.nodes.map((post: WordPressPost) => {
        // Get excerpt - WordPress returns HTML, so we need to strip tags
        const excerptText = post.excerpt
          ? post.excerpt.replace(/<[^>]*>/g, '').trim()
          : '';

        // Get image URL
        const imageUrl = post.featuredImage?.node?.sourceUrl || '';

        // Calculate reading time from content
        const readTime = post.content
          ? calculateReadingTime(post.content.replace(/<[^>]*>/g, ''))
          : '5 min read';

        // Get site URL from API response
        const siteUrl = (result as any).siteUrl || '';
        
        return {
          id: post.id,
          title: post.title || 'Untitled',
          excerpt: excerptText || 'No excerpt available',
          date: formatDate(post.date),
          imageUrl: imageUrl,
          readTime: readTime,
          slug: post.slug,
          uri: post.uri,
          link: post.uri && siteUrl ? `${siteUrl}${post.uri}` : undefined,
          categories: post.categories?.nodes?.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          })) || [],
          author: post.author?.node ? {
            id: post.author.node.id,
            name: post.author.node.name,
            slug: post.author.node.slug,
          } : undefined,
        };
      });

      // Transform categories
      const transformedCategories: BlogCategory[] = (result.categories?.nodes || []).map((cat: WordPressCategory) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count || 0,
      }));

      // Extract unique authors from posts
      const authorsMap = new Map<string, BlogAuthor>();
      transformedPosts.forEach(post => {
        if (post.author && !authorsMap.has(post.author.id)) {
          authorsMap.set(post.author.id, post.author);
        }
      });
      const transformedAuthors = Array.from(authorsMap.values());

      setPosts(transformedPosts);
      setCategories(transformedCategories);
      setAuthors(transformedAuthors);
    } catch (err: any) {
      console.error('Error fetching WordPress posts:', err);
      setError(err.message || 'Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, categories, authors, loading, error, refetch: fetchPosts };
}

