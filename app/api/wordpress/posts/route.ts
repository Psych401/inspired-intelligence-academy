/**
 * WordPress Posts API Route
 * 
 * Proxies GraphQL requests to WordPress backend to avoid CORS issues.
 * This route runs server-side, so CORS doesn't apply.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const graphqlUrl = process.env.WORDPRESS_GRAPHQL_URL || process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
    
    if (!graphqlUrl) {
      return NextResponse.json(
        { error: 'WORDPRESS_GRAPHQL_URL is not configured' },
        { status: 500 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const exclude = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build where clause for filtering
    const whereParts: string[] = ['orderby: { field: DATE, order: DESC }', 'status: PUBLISH'];
    if (category) {
      whereParts.push(`categoryName: "${category}"`);
    }
    if (exclude) {
      whereParts.push(`notIn: ["${exclude}"]`);
    }
    const whereClause = whereParts.join(', ');

    // Conditionally include categories query only if not filtering
    const includeCategories = !category && !exclude;

    // GraphQL query to fetch posts with categories, authors, and other metadata
    const query = `
      query GetPosts {
        posts(first: ${limit}, where: { ${whereClause} }) {
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
        ${includeCategories ? `
        categories(first: 100) {
          nodes {
            id
            name
            slug
            count
          }
        }
        ` : ''}
      }
    `;

    // Fetch from WordPress GraphQL endpoint
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      // Add cache revalidation
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

    // Extract WordPress site URL for building post links
    let siteUrl = '';
    try {
      const url = new URL(graphqlUrl);
      siteUrl = `${url.protocol}//${url.hostname}`;
    } catch (e) {
      // Fallback: try to extract manually
      siteUrl = graphqlUrl.replace('/graphql', '').replace('/wp-json', '').replace(/\/$/, '');
    }

    // Return the data with site URL included
    return NextResponse.json({
      ...result.data,
      siteUrl, // Include site URL for building post links
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching WordPress posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch WordPress posts' },
      { status: 500 }
    );
  }
}

