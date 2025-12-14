/**
 * WordPress Single Post API Route
 * 
 * Fetches a single blog post by slug
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const graphqlUrl = process.env.WORDPRESS_GRAPHQL_URL || process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
    
    if (!graphqlUrl) {
      return NextResponse.json(
        { error: 'WORDPRESS_GRAPHQL_URL is not configured' },
        { status: 500 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      );
    }

    // GraphQL query to fetch single post by slug
    const query = `
      query GetPost($slug: String!) {
        postBy(slug: $slug) {
          id
          title
          excerpt
          date
          content
          slug
          uri
          featuredImage {
            node {
              sourceUrl
              mediaDetails {
                width
                height
              }
            }
          }
          categories {
            nodes {
              id
              name
              slug
            }
          }
          author {
            node {
              id
              name
              slug
            }
          }
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { slug },
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json(
        { error: result.errors.map((e: any) => e.message).join(', ') },
        { status: 500 }
      );
    }

    if (!result.data?.postBy) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Extract WordPress site URL
    let siteUrl = '';
    try {
      const url = new URL(graphqlUrl);
      siteUrl = `${url.protocol}//${url.hostname}`;
    } catch (e) {
      siteUrl = graphqlUrl.replace('/graphql', '').replace('/wp-json', '').replace(/\/$/, '');
    }

    // Transform WordPress post to BlogPost format
    const post = result.data.postBy;
    const excerptText = post.excerpt
      ? post.excerpt.replace(/<[^>]*>/g, '').trim()
      : '';

    // Calculate reading time
    const wordsPerMinute = 200;
    const words = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    const readTime = `${minutes} min read`;

    // Format date
    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const transformedPost = {
      id: post.id,
      title: post.title || 'Untitled',
      excerpt: excerptText,
      date: date,
      imageUrl: post.featuredImage?.node?.sourceUrl || '',
      readTime: readTime,
      slug: post.slug,
      uri: post.uri,
      link: post.uri ? `${siteUrl}${post.uri}` : undefined,
      content: post.content || '',
      categories: post.categories?.nodes?.map((cat: any) => ({
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

    return NextResponse.json(transformedPost, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching WordPress post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch WordPress post' },
      { status: 500 }
    );
  }
}

