/**
 * Blog Post Detail Page
 * 
 * Displays individual blog post with table of contents and related posts
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import { addHeadingIds } from '@/lib/blog-content';

/**
 * Component to render blog content with IDs added to headings
 */
function BlogContent({ content }: { content: string }) {
  const processedContent = addHeadingIds(content);

  return (
    <div
      className="prose prose-lg max-w-none blog-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

function BlogPostContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/wordpress/post/${slug}`);
        
        if (!response.ok) {
          throw new Error('Post not found');
        }

        const data = await response.json();
        setPost(data);
      } catch (err: any) {
        console.error('Error fetching blog post:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-indigo mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white pb-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-brand-indigo hover:text-brand-blue mb-8 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Post Header */}
        <article>
          <header className="mb-8">
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 bg-brand-indigo/10 text-brand-indigo text-xs font-semibold rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-brand-indigo mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
              {post.author && (
                <span className="font-medium">By {post.author.name}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            {post.imageUrl && (
              <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </header>

          {/* Table of Contents and Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <TableOfContents content={post.content || ''} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <BlogContent content={post.content || ''} />
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {post.categories && post.categories.length > 0 && (
          <div className="mt-16">
            <RelatedPosts
              currentPostId={post.id}
              categorySlug={post.categories[0].slug}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-white pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-indigo mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BlogPostContent />
    </Suspense>
  );
}

