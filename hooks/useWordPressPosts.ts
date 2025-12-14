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
}

interface WordPressResponse {
  data?: {
    posts?: {
      nodes?: WordPressPost[];
    };
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
      const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || process.env.WORDPRESS_GRAPHQL_URL;
      
      if (!graphqlUrl) {
        throw new Error('WORDPRESS_GRAPHQL_URL or NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is not configured in .env.local');
      }

      // GraphQL query to fetch posts
      // This query works with WPGraphQL plugin for WordPress
      const query = `
        query GetPosts {
          posts(first: 100, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
            nodes {
              id
              title
              excerpt
              date
              featuredImage {
                node {
                  sourceUrl
                  mediaDetails {
                    width
                    height
                  }
                }
              }
              content
              slug
              uri
            }
          }
        }
      `;

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const result: WordPressResponse = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      if (!result.data?.posts?.nodes) {
        throw new Error('No posts data returned from WordPress');
      }

      // Transform WordPress posts to BlogPost format
      const transformedPosts: BlogPost[] = result.data.posts.nodes.map((post) => {
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

        // Extract WordPress site URL from GraphQL URL to build post links
        const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || process.env.WORDPRESS_GRAPHQL_URL || '';
        const siteUrl = graphqlUrl.replace('/graphql', '').replace('/wp-json', '');
        
        return {
          id: post.id,
          title: post.title || 'Untitled',
          excerpt: excerptText || 'No excerpt available',
          date: formatDate(post.date),
          imageUrl: imageUrl,
          readTime: readTime,
          slug: (post as any).slug,
          uri: (post as any).uri,
          link: (post as any).uri ? `${siteUrl}${(post as any).uri}` : undefined,
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

