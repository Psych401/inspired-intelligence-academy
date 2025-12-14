/**
 * WordPress GraphQL Hook
 * 
 * Fetches blog posts from WordPress backend using GraphQL API
 */

import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/types';

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

export function useWordPressPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
        };
      });

      setPosts(transformedPosts);
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

  return { posts, loading, error, refetch: fetchPosts };
}

